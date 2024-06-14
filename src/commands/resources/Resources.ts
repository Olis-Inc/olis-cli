import { Command } from "commander";
import {
  Resource,
  ResourceItemConfigEnv,
  ResourceItemManagementType,
  ResourceType,
} from "@src/types/resource";
import { Environment } from "@src/types/config";
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

  private delete(name: string) {
    try {
      this.logger.log(name);
      // Check resource to see if it exists
      // Delete resource for file system
      // Save to config file
    } catch (error) {
      this.logger.error(error);
    }
  }

  private start() {
    try {
      this.config.validate();
      env.validate();
      this.logger.log("got her o");
      // Generate dockercompose file
      // Save output to env file
      // Call docker compose up
    } catch (error) {
      this.logger.error(
        `An error occurred, ${error}. Did you forget to run olis-cli resource sync?`,
      );
    }
  }

  private stop() {
    this.logger.log("stop");
    // Call docker compose down
  }
}

export default Resources;
