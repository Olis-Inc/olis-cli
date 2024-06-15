import { DockerCompose } from "@src/build/Docker";
import { Framework } from "./config";

export type BuildProviderType = "docker";
export type BuildCompose = DockerCompose;

export interface BuildProvider {
  makeBuildFile: (framework: Framework) => Promise<void>;
  makeBuildComposeFile: (content: BuildCompose, filePath?: string) => void;
  runBuildComposeFile: (name: string, filePath?: string) => Promise<void>;
  destroyBuildComposeFile: (name: string, filePath?: string) => Promise<void>;
}
