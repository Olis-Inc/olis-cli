import Path from "@src/utils/Path";
import File from "@src/utils/File";
import { APP_FOLDER } from "@src/utils/constants";
import { AppConfig } from "../types/config";
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
    stateStorage: "local",
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

  get filePath() {
    for (const filePath of this.defaultFileLocations) {
      if (File.fileExists(filePath)) {
        return filePath;
      }
    }
    return null;
  }

  getConfig() {
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
}

export default Config;
