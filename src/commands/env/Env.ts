import { Command } from "commander";
import { Environment } from "@src/types/config";
import VCS from "@src/vcs";
import File from "@src/utils/File";
import { SyncEnvRequest } from "@src/types/vcs";
import {
  camelCaseToSnakeCase,
  jsonToKeyValuePairs,
  keyValuePairsToJSON,
} from "@src/utils/misc";
import Validator from "@src/utils/Validator";
import { envSchema } from "./validations.schema";
import BaseCommand from "../BaseCommand";

class Env extends BaseCommand {
  private validator = new Validator();

  constructor() {
    super("env");

    this.command.description("Manage your olis-cli environment variables");
    this.init();
  }

  private init() {
    const syncCommand = new Command("sync");
    syncCommand
      .description("Sync secrets")
      .option(
        "-env --environment <string>",
        "Comma-separated list of environments to sync",
        "production,staging",
      )
      .action(({ environment }) => {
        this.sync(environment);
      });

    this.command.addCommand(syncCommand);
  }

  validate(config = this.config.getConfig(), schema = envSchema) {
    for (const environment of Object.values(Environment)) {
      this.validator.validate(
        schema(config),
        this.getVariables(environment),
        config,
      );
    }
  }

  async sync(
    options: string = Object.keys(Environment)
      .filter((env) => env !== Environment.local)
      .join(","),
    warn = true,
  ) {
    try {
      const secrets = jsonToKeyValuePairs(this.secureStorage.all);
      const environments = options
        .split(",")
        .map((env) => env.trim() as Environment)
        .filter((env) => Object.values(Environment).includes(env));

      if (environments.length === 0) {
        throw new Error("Please provide valid environment(s)");
      }

      if (environments.includes(Environment.local)) {
        throw new Error(
          "Cannot sync local environments. Please remove 'local' from arguments",
        );
      }

      if (!this.config.get("manageRepository")) {
        throw new Error(
          "Repository is not managed. Run initialization process again to select this",
        );
      }

      if (!VCS.validateSetup()) {
        throw new Error(
          "Repository has not been setup. Run initialization process again to set this up",
        );
      }

      const envFile = this.config.get("environmentFile");
      if (!envFile) {
        throw new Error("Environment file not setup");
      }

      for (const env of environments) {
        const file = `${envFile}.${env}`;
        if (!File.fileExists(file)) {
          throw new Error(
            `Environment file for ${env} not setup. Create a ${file} file to proceed`,
          );
        }
      }

      const payload = environments.reduce<SyncEnvRequest>((request, env) => {
        const file = `${envFile}.${env}`;
        if (!File.fileExists(file)) {
          throw new Error(
            `Environment file for ${env} not setup. Create a ${file} file to proceed`,
          );
        }

        return {
          ...request,
          [env]: `${File.readFile(file)}\n${secrets}`,
        };
      }, {});

      // Warn
      if (warn) {
        const proceed = await this.prompt.warn(
          `You are about to replace existing values for ${environments.join(" and ")} remotely. Do you want to continue?`,
        );
        if (!proceed) {
          this.logger.log("Sync aborted");
          return;
        }
      }

      await VCS.syncEnv(payload);
      this.logger.success("Sync successful!");
    } catch (error) {
      this.logger.error(`Could not sync env variables, ${error}`);
    }
  }

  getEnvFilePath(env: Environment = Environment.local) {
    let envFile = this.config.get("environmentFile");
    if (!envFile) {
      throw new Error("Environment file not setup");
    }

    if (env === Environment.staging) {
      envFile = `${envFile}.staging`;
    } else if (env === Environment.production) {
      envFile = `${envFile}.production`;
    }

    if (!File.fileExists(envFile as string)) {
      throw new Error("Environment variable file does not exist");
    }

    return envFile as string;
  }

  getVariables(env: Environment = Environment.local) {
    const envFile = this.getEnvFilePath(env);
    const contents = keyValuePairsToJSON(File.readFile(envFile as string));

    return {
      ...contents,
      ...this.secureStorage.all, // Get Secrets
    };
  }

  // eslint-disable-next-line class-methods-use-this
  getKey(prefix: string, key: string) {
    return camelCaseToSnakeCase(`${prefix}_${key}`).toUpperCase();
  }

  private transformKeys(json: Record<string, unknown>, prefix: string) {
    return Object.keys(json).reduce<Record<string, unknown>>((obj, key) => {
      const envKey = this.getKey(prefix, key);
      // eslint-disable-next-line no-param-reassign
      obj[envKey] = json[key];
      return obj;
    }, {});
  }

  async save(
    content: Record<string, unknown>,
    prefix: string,
    env: Environment = Environment.local,
    override = false,
  ) {
    const envFile = this.getEnvFilePath(env);
    const newContent = this.transformKeys(content, prefix);
    let oldContent = {};
    if (!override) {
      oldContent = keyValuePairsToJSON(File.readFile(envFile as string));
    }

    const envContent = jsonToKeyValuePairs({
      ...oldContent,
      ...newContent,
    });
    await File.writeTo(envFile, envContent);
  }

  async delete(prefix: string, env: Environment = Environment.local) {
    const envFile = this.getEnvFilePath(env);
    const content = keyValuePairsToJSON(File.readFile(envFile as string));

    for (const key of Object.keys(content)) {
      if (key.startsWith(prefix.toUpperCase())) {
        delete content[key];
      }
    }

    const envContent = jsonToKeyValuePairs(content);
    await File.writeTo(envFile, envContent);
  }
}

export default Env;
