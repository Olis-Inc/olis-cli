import Path from "@src/utils/Path";
import File from "@src/utils/File";
import { APP_FOLDER } from "@src/utils/constants";
import { DistinctQuestion } from "@src/utils/Prompt";
import { AppConfig, Framework, StateStorage } from "../types/config";
import Logger from "../utils/Logger";
import Storage from "../utils/Storage";

class Config {
  private storage = new Storage();

  private logger = new Logger();

  private baseConfig: AppConfig = {
    framework: undefined,
    name: APP_FOLDER,
    hostname: undefined,
    subdomain: undefined,
    environmentFile: ".env",
    stateStorage: StateStorage.local,
    compute: {},
    architecture: undefined,
    infrastructure: true,
    middleware: [],
    manageRepository: true,
  };

  defaultFileLocations = [
    `${Path.cwd}/olisconfig.json`,
    `${Path.cwd}/.olisconfigrc`,
    `${Path.cwd}/olisconfig.yaml`,
    `${Path.cwd}/olisconfig.yml`,
  ];

  // eslint-disable-next-line class-methods-use-this
  getSetupQuestions(
    defaults: Partial<AppConfig>,
  ): Array<DistinctQuestion & { name: keyof AppConfig }> {
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
}

export default Config;
