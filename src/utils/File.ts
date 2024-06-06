/* eslint-disable no-await-in-loop */
import f, { promises as fs, constants } from "fs";
import path from "path";
import yaml from "js-yaml";
import prettier from "prettier";
import Logger from "./Logger";

class File {
  static encoding: BufferEncoding = "utf-8";

  static logger = new Logger();

  static fileExists(filePath: string) {
    return f.existsSync(filePath);
  }

  private static readJsonFile(filePath: string) {
    try {
      const data = f.readFileSync(path.resolve(filePath), this.encoding);
      return JSON.parse(data);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private static async readYamlFile(filePath: string) {
    try {
      const data = f.readFileSync(path.resolve(filePath), this.encoding);
      return yaml.load(data);
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  private static async writeToYamlFile(filePath: string, data: unknown) {
    try {
      const formattedData = await prettier.format(yaml.dump(data), {
        parser: "yaml",
      });
      await fs.writeFile(path.resolve(filePath), formattedData, {
        flag: "w",
        encoding: this.encoding,
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static async writeTo(filePath: string, data: unknown, parser?: string) {
    try {
      let formattedData = data;
      if (parser) {
        formattedData = await prettier.format(JSON.stringify(data), {
          parser,
        });
      }
      await fs.writeFile(path.resolve(filePath), formattedData as string, {
        flag: "w",
        encoding: this.encoding,
      });
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static readFile(filePath: string) {
    const extension = path.extname(filePath);
    const name = path.basename(filePath);

    try {
      switch (extension) {
        case ".json":
          return this.readJsonFile(filePath);
          break;

        case ".yaml":
        case ".yml":
          return this.readYamlFile(filePath);
          break;

        default:
          if (name.startsWith(".") && name.endsWith("rc")) {
            return this.readJsonFile(filePath);
          }

          throw new Error("Unsupported file extension");
      }
    } catch (error) {
      throw new Error(`Could not read file, ${error}`);
    }
  }

  static async writeToFile(filePath: string, data: Record<string, unknown>) {
    try {
      const extension = path.extname(filePath);
      const name = path.basename(filePath);

      switch (extension) {
        case ".json":
          return await this.writeTo(filePath, data, "json");

        case ".yaml":
        case ".yml":
          return await this.writeToYamlFile(filePath, data);

        default:
          if (name.startsWith(".") && name.endsWith("rc")) {
            return await this.writeTo(filePath, data, "json");
          }

          throw new Error("Unsupported file extension");
      }
    } catch (error) {
      throw new Error(`Could not write to file, ${error}`);
    }
  }

  static async copy(source: string, destination: string) {
    try {
      await fs.copyFile(source, destination, constants.COPYFILE_FICLONE);
      return Promise.resolve();
    } catch (error) {
      this.logger.error(`Error copying file, ${error}`);
      return Promise.reject(error);
    }
  }
}

export default File;
