import { Command } from "commander";
import { ComputeConfig, ComputeProvider } from "@src/types/compute";
import BaseCommand from "../BaseCommand";
import env from "../env";
import Providers from "./Providers";
import { envSchema } from "./validations.schema";

class Compute extends BaseCommand {
  constructor() {
    super("compute");

    this.command.description("Manage your olis-cli compute instances");
    this.init();
  }

  private init() {
    const setCommand = new Command("set");
    setCommand
      .description("Set compute")
      .option("-p --production [string]", "Compute for Production")
      .option("-s --staging [string]", "Compute for Staging")
      .action((compute) => {
        this.set(compute);
      });

    const syncCommand = new Command("sync");
    syncCommand.description("Sync compute").action(() => {
      this.sync();
    });

    const unsetCommand = new Command("unset");
    unsetCommand.description("Unset compute").action(() => {
      this.unset();
    });

    const validateCommand = new Command("validate");
    validateCommand.description("Validate Compute").action(() => {
      this.validate();
    });

    this.command.addCommand(setCommand);
    this.command.addCommand(unsetCommand);
    this.command.addCommand(validateCommand);
    this.command.addCommand(syncCommand);
  }

  private async getEnvCompute(compute: Partial<ComputeConfig>) {
    const [stagingProvider, stagingInstance] = (compute.staging || "").split(
      ":",
    );
    const [productionProvider, productionInstance] = (
      compute.production || ""
    ).split(":");

    const answers = await this.prompt.ask<{
      stagingProvider: string;
      stagingInstance?: string;
      productionProvider: string;
      productionInstance?: string;
    }>([
      {
        type: "list",
        name: "stagingProvider",
        choices: Object.values(ComputeProvider),
        message: "Staging Provider:",
        default: stagingProvider,
      },
      {
        type: "input",
        name: "stagingInstance",
        message: "Staging Instance:",
        default: stagingInstance,
        when: (answers) => answers.stagingProvider !== ComputeProvider.none,
        validate: (value) =>
          this.prompt.validations.required(value, `Please enter instance name`),
      },
      {
        type: "list",
        name: "productionProvider",
        choices: Object.values(ComputeProvider),
        message: "Production Provider:",
        default: productionProvider,
      },
      {
        type: "input",
        name: "productionInstance",
        message: "Production Instance (leave blank if none):",
        default: productionInstance,
        when: (answers) => answers.productionProvider !== ComputeProvider.none,
        validate: (value) =>
          this.prompt.validations.required(value, `Please enter instance name`),
      },
    ]);

    return {
      staging: `${answers.stagingProvider}${answers.stagingInstance ? `:${answers.stagingInstance}` : ""}`,
      production: `${answers.productionProvider}${answers.productionInstance ? `:${answers.productionInstance}` : ""}`,
    };
  }

  private async set(compute: Partial<ComputeConfig>) {
    try {
      const config = this.config.getConfig();
      const envCompute = await this.getEnvCompute(compute);
      await Providers.getCredentials(envCompute);

      config.compute.production = envCompute.production;
      config.compute.staging = envCompute.staging;

      // To make sure config is valid, validate before save
      this.config.validate(config);
      await env.sync();
      await this.config.update(config);
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async sync() {
    try {
      const config = this.config.getConfig();
      this.config.validate(config);

      const { inSync } = await Providers.getCredentials(
        config.compute,
        (q) => !q.default, // Filter items without a value yet
      );

      if (inSync) {
        this.logger.success("Already in sync!");
        return;
      }

      // Save items
      await env.sync();
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async unset() {
    try {
      const config = this.config.getConfig();
      this.config.validate(config);

      // warn
      const proceed = await this.prompt.warn(
        "You are about to unset your compute from this project. Do you want to continue?",
        false,
      );
      if (!proceed) {
        return;
      }

      // Unset compute
      config.compute.production = "none";
      config.compute.staging = "none";
      await this.config.update(config);
    } catch (error) {
      this.logger.error(error);
    }
  }

  private async validate() {
    try {
      const config = this.config.getConfig();
      this.config.validate(config);
      env.validate(config, envSchema);
      this.logger.success("Compute seems perfect!");
    } catch (error) {
      this.logger.error(
        `An error occurred, ${error}. Did you forget to run olis-cli compute sync or you need to adjust your resources config?`,
      );
    }
  }
}

export default Compute;
