import { BuildCompose, BuildProvider } from "@src/types/build";
import { Framework } from "@src/types/config";
import Cmd from "@src/utils/Cmd";
import File from "@src/utils/File";
import HttpRequest from "@src/utils/HttpRequest";
import path from "path";

interface Service {
  image: string;
  ports: Array<string>;
  networks?: Array<string>;
  environment?: Record<string, string | number | boolean>;
  volumes?: Array<string>;
  hostname?: string;
  container_name?: string;
}

interface Network {
  driver: "bridge";
  internal: boolean;
}

export interface DockerCompose {
  version: string;
  services: Record<string, Service>;
  networks?: Record<string, Partial<Network>>;
}

class Docker implements BuildProvider {
  defaultBuildComposeFilePath = ".olis/compose.yaml";

  // eslint-disable-next-line class-methods-use-this
  get api() {
    return new HttpRequest({
      baseURL: "https://raw.githubusercontent.com/Olis-Inc/templates/main",
    }).api;
  }

  // eslint-disable-next-line class-methods-use-this
  async makeBuildFile(framework: Framework): Promise<void> {
    try {
      const data = await this.api.get(
        `/vcs/docker/${framework.toLowerCase()}/Dockerfile`,
      );
      await File.writeTo("Dockerfile", data);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  makeBuildComposeFile(
    content: BuildCompose,
    filePath = this.defaultBuildComposeFilePath,
  ) {
    File.writeToFile(filePath, content as unknown as Record<string, unknown>);
  }

  async runBuildComposeFile(
    name: string,
    filePath = this.defaultBuildComposeFilePath,
  ) {
    const dir = path.dirname(filePath);
    const RUNNING_CONTAINERS = await Cmd.run(
      `docker ps --filter "label=com.docker.compose.project=${name}" --format "{{.Names}}"`,
    );

    if (!RUNNING_CONTAINERS) {
      await Cmd.run(`cd ${dir} && docker compose -p ${name} up -d`);
    }
  }

  async destroyBuildComposeFile(
    name: string,
    filePath = this.defaultBuildComposeFilePath,
  ) {
    const dir = path.dirname(filePath);
    const RUNNING_CONTAINERS = await Cmd.run(
      `docker ps --filter "label=com.docker.compose.project=${name}" --format "{{.Names}}"`,
    );

    if (RUNNING_CONTAINERS) {
      await Cmd.run(`cd ${dir} && docker compose -p ${name} down`);
    }
  }
}

export default Docker;
