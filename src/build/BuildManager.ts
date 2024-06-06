import { BuildProvider, BuildProviderType } from "@src/types/build";
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
}

export default BuildManager;
