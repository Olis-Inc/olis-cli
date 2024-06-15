import {
  BuildCompose,
  BuildProvider,
  BuildProviderType,
} from "@src/types/build";
import { Framework } from "@src/types/config";
import Docker from "./Docker";

class BuildManager {
  private providerType: BuildProviderType = "docker";

  constructor(providerType: BuildProviderType = "docker") {
    this.providerType = providerType;
  }

  get provider(): BuildProvider {
    switch (this.providerType) {
      case "docker":
        return new Docker();

      default:
        throw new Error("Invalid provider type specified");
    }
  }

  makeBuildFile(framework: Framework) {
    return this.provider.makeBuildFile(framework);
  }

  makeBuildComposeFile(content: BuildCompose, filePath?: string) {
    return this.provider.makeBuildComposeFile(content, filePath);
  }

  runBuildComposeFile(name: string, filePath?: string) {
    return this.provider.runBuildComposeFile(name, filePath);
  }

  destroyBuildComposeFile(name: string, filePath?: string) {
    return this.provider.destroyBuildComposeFile(name, filePath);
  }
}

export default BuildManager;
