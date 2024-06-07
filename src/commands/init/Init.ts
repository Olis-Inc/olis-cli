/* eslint-disable no-restricted-syntax */
import { Option } from "commander";
import VCS from "@src/vcs";
import BaseCommand from "../BaseCommand";
import { APP_FOLDER } from "../../utils/constants";
import { AppConfig, Framework } from "../../types/config";

interface InitCliOption extends Pick<Option, "flags" | "description"> {
  name: keyof AppConfig;
  default?: unknown;
  choices?: Array<string>;
}

class Init extends BaseCommand {
  private defaultAppName = APP_FOLDER;

  constructor() {
    super("init");
    this.init();
  }

  get options(): Array<InitCliOption> {
    const defaults = this.config.getConfig();
    return [
      {
        name: "framework",
        flags: "-fw, --framework [string]",
        description: "Framework associated with App",
        choices: Object.values(Framework),
        default: defaults.framework,
      },
      {
        name: "hostname",
        flags: "-h, --hostname [string]",
        description: "Hostname of App",
        default: defaults.hostname,
      },
      {
        name: "subdomain",
        flags: "-s, --subdomain [string]",
        description: "Subdomain of App",
        default: defaults.subdomain,
      },
      {
        name: "infrastructure",
        flags: "-infra, --infrastructure [string]",
        description: "Whether to add infrastructure code",
        default: defaults.infrastructure,
      },
      {
        name: "environmentFile",
        flags: "-env-file, --environment-file [string]",
        description: "Whether to add infrastructure code",
        default: defaults.environmentFile,
      },
      {
        name: "stateStorage",
        flags: "-ss, --state-storage [stateStorage]",
        description: "State store for infrastructure config",
        default: defaults.stateStorage,
      },
      {
        name: "architecture",
        flags: "-a, --architecture [string]",
        description: "Infrastructural Architecture of App/Project",
        default: defaults.architecture,
      },
      {
        name: "manageRepository",
        flags: "-repo, --repository [boolean]",
        description: "Whether to manage your repository for you",
        default: defaults.manageRepository,
      },
    ];
  }

  private init() {
    this.command = this.command
      .description("Initialize Project with olis-cli")
      .argument("[string]", "Name of App", this.defaultAppName);

    this.addCliOptions();
    this.command.action((name, options) => {
      this.action(name, options);
    });
  }

  private getOptions() {
    const config = this.config.getConfig();
    return this.options.map((option) => ({
      ...option,
      default: config[option.name],
    }));
  }

  private addCliOptions() {
    const options = this.getOptions();
    for (const option of options) {
      const cliOption = new Option(option.flags, option.description).default(
        option.default,
      );

      if (option.choices) {
        cliOption.choices(option.choices);
      }

      this.command.addOption(cliOption);
    }
  }

  async action(name: string, cliOptions: Partial<AppConfig>) {
    try {
      const questions = this.config.getSetupQuestions(cliOptions);
      const answers = await this.prompt.ask(questions);
      if (answers.manageRepository) {
        await VCS.setupRepository(name);
      }

      const config: Partial<AppConfig> = {
        name,
        ...answers,
      };

      await this.config.update(config);
      await this.buildManager.makeBuildFile(config.framework as Framework);

      // Use chalk
      this.logger.log("Initialization successful! 💫");
    } catch (error) {
      this.logger.error(error);
    }
  }
}

export default Init;
