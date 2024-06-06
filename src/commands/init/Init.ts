/* eslint-disable no-restricted-syntax */
import { Option } from "commander";
import VCS from "@src/vcs";
import BaseCommand from "../BaseCommand";
import { QuestionCollection } from "../../utils/Prompt";
import { APP_FOLDER } from "../../utils/constants";
import { AppConfig, ConfigOption, Framework } from "../../types/config";

class Init extends BaseCommand {
  private defaultAppName = APP_FOLDER;

  private options: Array<ConfigOption> = [
    {
      name: "framework",
      type: "list",
      flags: "-fw, --framework [string]",
      description: "Framework associated with App",
      choices: Object.values(Framework),
      prompt: {
        message: "What language are you developing with?",
      },
    },
    {
      name: "hostname",
      flags: "-h, --hostname [string]",
      description: "Hostname of App",
      prompt: {
        message: "What is the Hostname of your app?",
      },
    },
    {
      name: "subdomain",
      flags: "-s, --subdomain [string]",
      description: "Subdomain of App",
      prompt: {
        message: "What is the Subdomain of your app?",
      },
    },
    {
      name: "infrastructure",
      flags: "-infra, --infrastructure [string]",
      description: "Whether to add infrastructure code",
    },
    {
      name: "environmentFile",
      flags: "-env-file, --environment-file [string]",
      description: "Whether to add infrastructure code",
    },
    {
      name: "stateStorage",
      flags: "-ss, --state-storage [stateStorage]",
      description: "State store for infrastructure config",
      prompt: {
        message: "Preferred State Store?",
      },
    },
    {
      name: "architecture",
      flags: "-a, --architecture [string]",
      description: "Infrastructural Architecture of App/Project",
    },
    {
      type: "confirm",
      name: "manageRepository",
      flags: "-repo, --repository [boolean]",
      description: "Whether to manage your repository for you",
      prompt: {
        message: "Would you like to manage your repo automatically?",
      },
    },
  ];

  constructor() {
    super("init");
    this.init();
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
      const cliOption = new Option(option.flags, option.description);

      cliOption.default(option.default);
      if (option.type === "list" && option.choices) {
        cliOption.choices(option.choices);
      }

      this.command.addOption(cliOption);
    }
  }

  private getQuestions(options: Partial<AppConfig>): QuestionCollection {
    return this.getOptions()
      .filter((option) => option.prompt)
      .map((option) => ({
        type: option.type,
        choices: option.choices,
        name: option.name,
        message: option.prompt?.message,
        default: options[option.name] || option.default,
      }));
  }

  async action(name: string, cliOptions: Partial<AppConfig>) {
    try {
      const questions = this.getQuestions({
        ...cliOptions,
        name,
      });
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
