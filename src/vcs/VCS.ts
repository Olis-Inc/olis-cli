import { SyncEnvRequest, VCSProvider } from "@src/types/vcs";
import Prompt, { QuestionCollection } from "@src/utils/Prompt";
import Storage from "@src/utils/Storage";
import {
  VCS_ACCESS_TOKEN_KEY,
  VCS_PROVIDER,
  VCS_REPOSITORY,
  VCS_REPOSITORY_OWNER,
  VCS_REPOSITORY_URL,
} from "@src/utils/constants";
import GitHub from "./GitHub";

class VCS {
  private static secureStorage = new Storage("secrets");

  private static appStorage = new Storage("app");

  private static prompt = new Prompt();

  private static getSetupQuestions(name: string): QuestionCollection {
    return [
      {
        name: "name",
        type: "string",
        message: "Repository name:",
        default: name,
      },
      {
        name: "provider",
        type: "list",
        message: "Provider:",
        choices: Object.values(VCSProvider),
        default: this.appStorage.get(VCS_REPOSITORY),
      },
      {
        name: "owner",
        type: "string",
        message: "Owner:",
        default: this.appStorage.get(VCS_REPOSITORY_OWNER),
        validate: (value) =>
          this.prompt.validations.required(value, "Please enter a username"),
      },
      {
        name: "private",
        type: "confirm",
        message: "Private:",
        default: true,
      },
      {
        name: "accessToken",
        type: "password",
        message: "Access Token:",
        default: this.secureStorage.get(VCS_ACCESS_TOKEN_KEY),
        validate: (value) =>
          this.prompt.validations.required(
            value,
            "Please enter a valid access token",
          ),
      },
    ];
  }

  static async setupRepository(name: string) {
    try {
      const questions = this.getSetupQuestions(name);
      const {
        provider,
        accessToken,
        name: repoName,
        private: isPrivate,
        owner,
      } = await this.prompt.ask(questions);
      this.secureStorage.set(VCS_ACCESS_TOKEN_KEY, accessToken);
      this.appStorage.set(VCS_PROVIDER, provider);

      switch (provider as VCSProvider) {
        case VCSProvider.GitHub:
          await GitHub.createRepository({
            name: repoName,
            private: isPrivate,
            owner,
          });
          break;

        default:
          throw new Error(`Unrecognized provider, ${provider}`);
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  static validateSetup() {
    if (
      this.secureStorage.get(VCS_ACCESS_TOKEN_KEY) &&
      this.appStorage.get(VCS_REPOSITORY) &&
      this.appStorage.get(VCS_PROVIDER) &&
      this.appStorage.get(VCS_REPOSITORY_URL) &&
      this.appStorage.get(VCS_REPOSITORY_OWNER)
    ) {
      return true;
    }

    return false;
  }

  static async syncEnv(payload: SyncEnvRequest) {
    const provider = this.appStorage.get(VCS_PROVIDER);

    try {
      switch (provider as VCSProvider) {
        case VCSProvider.GitHub:
          await GitHub.syncEnv(payload);
          break;

        default:
          throw new Error(`Unrecognized provider, ${provider}`);
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default VCS;
