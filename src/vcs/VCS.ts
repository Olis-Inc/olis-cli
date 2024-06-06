import Config from "@src/config/Config";
import { VCSProvider } from "@src/types/vcs";
import Logger from "@src/utils/Logger";
import Prompt, { QuestionCollection } from "@src/utils/Prompt";
import Storage from "@src/utils/Storage";

class VCS {
  private static storage = new Storage("secret");

  private static logger = new Logger();

  private static config = new Config();

  private static prompt = new Prompt();

  private static getQuestions(name: string): QuestionCollection {
    return [
      {
        name: "name",
        type: "string",
        message: "Repository name:",
        default: name,
      },
      {
        name: "Provider",
        type: "list",
        message: "Provider:",
        choices: Object.values(VCSProvider),
      },
      {
        name: "accessToken",
        type: "string",
        message: "Access Token:",
        validate(value) {
          if (value.trim() === "") {
            return "Please enter a valid access token";
          }
          return true;
        },
      },
    ];
  }

  static async setupRepository(name: string) {
    try {
      const questions = this.getQuestions(name);
      const answers = await this.prompt.ask(questions);
      // Save repository name to app config and package.json
      // Save provider credentials to global config
      this.logger.log(answers);
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default VCS;
