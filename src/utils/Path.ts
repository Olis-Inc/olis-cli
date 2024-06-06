import { BuildProviderType } from "@src/types/build";
import { Framework } from "@src/types/config";
import path, { dirname } from "path";
import { fileURLToPath } from "url";

class Path {
  static cwd: string = process.cwd();

  static getBuildFilePath(
    providerType: BuildProviderType,
    framework: Framework,
    fileName: string,
  ) {
    const dir = dirname(fileURLToPath(import.meta.url));
    return path.resolve(
      dir,
      `../data/build/${providerType.toLowerCase()}/${framework.toLowerCase()}/${fileName}`,
    );
  }
}

export default Path;
