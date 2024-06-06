/* eslint-disable no-restricted-syntax */
import { Option } from "commander";
import BaseCommand from "../BaseCommand";
import { QuestionCollection } from "../../utils/Prompt";
import { APP_FOLDER } from "../../utils/constants";
import { ConfigOption } from "../../types/config";

class Init extends BaseCommand {
  private defaultAppName = APP_FOLDER;

  private options: Array<ConfigOption> = [
    {
      name: "language",
      type: "list",
      flags: "-lang, --language [string]",
      description: "Language associated with App",
      choices: ["NodeJS", "React"],
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
      name: "template",
      flags: "-t, --template [string]",
      description: "Template of app to clone",
    },
    // {
    //   flags: "-repo, --repository [string]",
    //   description: "Repository of app",
    //   attributeName: () => "repository",
    //   prompt: true,
    // },
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
      default: config[option.name] || undefined,
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

  private getQuestions(options: Record<string, unknown>): QuestionCollection {
    const updatedOptions = this.getOptions();

    return updatedOptions
      .filter((option) => option.prompt)
      .map((option) => ({
        type: option.type,
        choices: option.choices,
        name: option.name,
        message: option.prompt?.message,
        default: options[option.name] || option.default,
      }));
  }

  async action(name: string, cliOptions: Record<string, unknown>) {
    try {
      const questions = this.getQuestions(cliOptions);
      const answers = await this.prompt.ask(questions);
      // Maybe check respository here
      // Also check for template

      this.config.update({
        name,
        ...answers,
      });
    } catch (error) {
      this.logger.error(error);
    }
  }
}

export default Init;
