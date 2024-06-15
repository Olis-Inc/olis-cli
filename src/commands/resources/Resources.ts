import { Command } from "commander";
import {
  Resource,
  ResourceItemConfigEnv,
  ResourceItemManagementType,
  ResourceType,
} from "@src/types/resource";
import { AppConfig, Environment } from "@src/types/config";
import { BuildCompose } from "@src/types/build";
import BaseCommand from "../BaseCommand";
import Mongo from "./Mongo";
import env from "../env";

class Resources extends BaseCommand {
  private mongo = new Mongo();

  constructor() {
    super("resources");

    this.command.description("Manage your olis-cli resources");
    this.init();
  }

  private init() {
    const addCommand = new Command("add");
    addCommand
      .description("Add resource")
      .argument("<string>", "Resource to add")
      .action((resource) => {
        this.add(resource);
      });

    const syncCommand = new Command("sync");
    syncCommand
      .description("Sync resource")
      .argument("<string>", "Resource to sync")
      .action((resource) => {
        this.sync(resource);
      });

    const deleteCommand = new Command("delete");
    deleteCommand
      .description("Delete resource")
      .argument("<string>", "Resource to delete")
      .action((resource) => {
        this.delete(resource);
      });

    const startCommand = new Command("start");
    startCommand.description("Start resources").action(() => {
      this.start();
    });

    const stopCommand = new Command("stop");
    stopCommand.description("Stop resources").action(() => {
      this.stop();
    });

    this.command.addCommand(addCommand);
    this.command.addCommand(deleteCommand);
    this.command.addCommand(startCommand);
    this.command.addCommand(stopCommand);
    this.command.addCommand(syncCommand);
  }

  getResource(
    resourceType: ResourceType,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Resource<Record<string, any> & { port: number }> {
    switch (resourceType) {
      case ResourceType.mongo:
        return this.mongo;
      default:
        throw new Error(`Unrecognised resource ${resourceType}`);
    }
  }

  // eslint-disable-next-line class-methods-use-this
  private makeBuildComposeContent(config: AppConfig) {
    return Object.keys(config.resources).reduce<BuildCompose>(
      (acc, key) => {
        const resourceConfig = config.resources[key as ResourceType]!;
        const resource = this.getResource(key as ResourceType);

        const variables = env.getVariables(Environment.local);
        const port = variables[env.getKey(key, "port")] || resourceConfig.port;

        acc.services[key] = {
          image: `${key}:latest`,
          container_name: `olis-${key}-${config.name}`,
          ports: [`${port}:${port}`],
          networks: [config.name],
          environment: resource.buildInputVariableKeys
            .map((varKey) => env.getKey(key, varKey))
            .reduce<Record<string, string | number | boolean>>((acc, key) => {
              acc[key] = variables[key];
              return acc;
            }, {}),
        };
        return acc;
      },
      {
        version: "3.3",
        services: {},
        networks: {
          [config.name]: {
            internal: false,
          },
        },
      },
    );
  }

  private async getEnvConfig() {
    return this.prompt.ask<ResourceItemConfigEnv>([
      {
        type: "list",
        name: Environment.staging,
        choices: Object.values(ResourceItemManagementType),
        message: "Staging:",
      },
      {
        type: "list",
        name: Environment.production,
        choices: Object.values(ResourceItemManagementType),
        message: "Production:",
      },
    ]);
  }

  // eslint-disable-next-line class-methods-use-this
  private async saveVariablesToEnv(
    resource: ResourceType,
    variables: Record<string, unknown>,
  ) {
    await Promise.all(
      Object.values(Environment).map((environment) =>
        env.save(variables, resource, environment),
      ),
    );
  }

  // eslint-disable-next-line class-methods-use-this
  private async deleteVariablesFromEnv(resource: ResourceType) {
    await Promise.all(
      Object.values(Environment).map((environment) =>
        env.delete(resource, environment),
      ),
    );
  }

  private async add(name: ResourceType) {
    try {
      const config = this.config.getConfig();
      this.config.validate(config);

      const envConfig = await this.getEnvConfig();
      const answers = await this.getResource(name).getInputVariables(envConfig);

      // Save items
      await this.saveVariablesToEnv(name, answers);
      config.resources[name] = {
        env: envConfig,
        port: answers.port!,
      };

      await Promise.all([this.config.update(config), env.sync()]);
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async sync(name: ResourceType) {
    try {
      const config = this.config.getConfig();
      const variables = env.getVariables();
      this.config.validate(config);

      const answers = await this.getResource(name).getInputVariables(
        config.resources[name]!.env,
        variables,
        (q) => !q.default, // Filter items without a value yet
      );

      if (Object.keys(answers).length === 0) {
        this.logger.log("Already in sync!");
        return;
      }

      // Save items
      await this.saveVariablesToEnv(name, answers);
      await env.sync();
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async delete(name: ResourceType) {
    try {
      const config = this.config.getConfig();
      this.config.validate(config);

      // Check resource to see if it exists
      if (!config.resources[name]) {
        throw new Error(`Resource ${name} does not exist in resources`);
      }

      // warn
      const proceed = await this.prompt.warn(
        "You are about to remove a resource from this project. All associated environment variables and configs will be lost permanently. Do you want to continue?",
        false,
      );
      if (!proceed) {
        return;
      }

      // Delete resource for file system
      delete config.resources[name];
      await Promise.all([
        this.deleteVariablesFromEnv(name),
        this.config.update(config),
      ]);
      await env.sync(undefined, false);
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async start() {
    try {
      const config = this.config.getConfig();
      this.config.validate(config);
      env.validate();
      // Generate dockercompose file
      this.buildManager.makeBuildComposeFile(
        this.makeBuildComposeContent(config),
      );

      // Call run build compose file
      this.logger.log("Starting Resources...");
      await this.buildManager.runBuildComposeFile(config.name);
      this.logger.success("Resources are up and running! 🆙");
    } catch (error) {
      this.logger.error(
        `An error occurred, ${error}. Did you forget to run olis-cli resource sync?`,
      );
    }
  }

  private stop() {
    try {
      const config = this.config.getConfig();
      this.config.validate(config);
      this.logger.log("Stopping Resources...");
      this.buildManager.destroyBuildComposeFile(config.name);
      this.logger.success("Resources have been shut down 🔻");
    } catch (error) {
      this.logger.error(`An error occurred, ${error}`);
    }
  }
}

export default Resources;
