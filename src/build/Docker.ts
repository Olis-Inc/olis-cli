import { BuildProvider } from "@src/types/build";
import { Framework } from "@src/types/config";
import File from "@src/utils/File";
import HttpRequest from "@src/utils/HttpRequest";

class Docker implements BuildProvider {
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
        `/docker/${framework.toLowerCase()}/Dockerfile`,
      );
      await File.writeTo("Dockerfile", data);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default Docker;
