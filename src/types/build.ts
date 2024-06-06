import { Framework } from "./config";

export type BuildProviderType = "docker";

export interface BuildProvider {
  makeBuildFile: (framework: Framework) => Promise<void>;
}
