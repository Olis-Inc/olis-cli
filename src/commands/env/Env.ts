import { Command } from "commander";
import { Environment } from "@src/types/config";
import VCS from "@src/vcs";
import File from "@src/utils/File";
import { SyncEnvRequest } from "@src/types/vcs";
import BaseCommand from "../BaseCommand";

class Env extends BaseCommand {
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

  private async sync(options: string) {
    try {
      const environments = options
        .split(",")
        .map((env) => env.trim() as Environment)
        .filter((env) => Object.keys(Environment).includes(env.toString()));

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
          [env]: File.readFile(file),
        };
      }, {});

      // Warn
      const proceed = await this.prompt.warn(
        `You are about to replace existing values for ${environments.join(" and ")} remotely. Do you want to continue?`,
      );
      if (!proceed) {
        this.logger.log("Sync aborted");
        return;
      }

      await VCS.syncEnv(payload);
      this.logger.success("Sync successful!");
    } catch (error) {
      this.logger.error(`Could not sync env variables, ${error}`);
    }
  }
}

export default Env;
