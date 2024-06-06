import inquirer, { Answers, QuestionCollection } from "inquirer";

class Prompt {
  private prompt = inquirer.createPromptModule();

  async ask(questions: QuestionCollection): Promise<Answers> {
    try {
      const answers = await this.prompt(questions);
      return Promise.resolve(answers);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}

export default Prompt;
export { QuestionCollection };
