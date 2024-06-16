import Path from "@src/utils/Path";
import File from "@src/utils/File";
import { APP_FOLDER } from "@src/utils/constants";
import { PromptQuestion } from "@src/types/prompt";
import Validator from "@src/utils/Validator";
import { AppConfig, Framework, StateStorage } from "../types/config";
import Logger from "../utils/Logger";
import Storage from "../utils/Storage";
import { configSchema } from "./validations.schema";

class Config {
  private storage = new Storage();

  private logger = new Logger();

  private validator = new Validator();

  private baseConfig: AppConfig = {
    framework: undefined,
    name: APP_FOLDER,
    hostname: undefined,
    subdomain: undefined,
    environmentFile: ".env",
    stateStorage: StateStorage.local,
    compute: {
      staging: "none",
      production: "none",
    },
    architecture: "none",
    infrastructure: true,
    resources: {},
    manageRepository: true,
  };

  defaultFileLocations = [
    `${Path.cwd}/olisconfig.json`,
    `${Path.cwd}/.olisconfigrc`,
    `${Path.cwd}/olisconfig.yaml`,
    `${Path.cwd}/olisconfig.yml`,
  ];

  validate(config = this.getConfig()) {
    return this.validator.validate(configSchema, config);
  }

  // eslint-disable-next-line class-methods-use-this
  getSetupQuestions(
    defaults: Partial<AppConfig>,
  ): Array<PromptQuestion<AppConfig>> {
    return [
      {
        name: "framework",
        type: "list",
        choices: Object.values(Framework),
        message: "What language are you developing with?",
        default: defaults.framework,
      },
      {
        name: "hostname",
        message: "What is the Hostname of your app?",
        default: defaults.hostname,
      },
      {
        name: "subdomain",
        message: "What is the Subdomain of your app?",
        default: defaults.subdomain,
      },
      {
        name: "stateStorage",
        type: "list",
        message: "Preferred State Store?",
        default: defaults.stateStorage,
        choices: Object.values(StateStorage),
      },
      {
        name: "manageRepository",
        type: "confirm",
        message: "Would you like to manage your repo automatically?",
        default: defaults.manageRepository,
      },
    ];
  }

  get filePath() {
    for (const filePath of this.defaultFileLocations) {
      if (File.fileExists(filePath)) {
        return filePath;
      }
    }
    return null;
  }

  getConfig(): AppConfig {
    try {
      let data = this.baseConfig;
      const { filePath } = this;

      if (filePath) {
        // Handle other types that don't come as json
        data = File.readFile(filePath) as AppConfig;
      }

      return data;
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async update(config: Partial<AppConfig>) {
    const data = this.getConfig();
    await File.writeToFile(this.filePath || this.defaultFileLocations[0], {
      ...data,
      ...config,
    });
  }

  get(key: keyof AppConfig) {
    return this.getConfig()[key];
  }

  async set(key: keyof AppConfig, value: never) {
    const data = this.getConfig();
    data[key] = value;
  }
}

export default Config;
