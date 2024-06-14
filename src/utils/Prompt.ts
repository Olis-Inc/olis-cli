/* eslint-disable class-methods-use-this */
import { PromptQuestion } from "@src/types/prompt";
import inquirer from "inquirer";

class Prompt {
  private prompt = inquirer.createPromptModule();

  async ask<T>(questions: Array<PromptQuestion<T>>): Promise<T> {
    try {
      const answers = await this.prompt(questions);
      const filteredAnswers = Object.fromEntries(
        Object.entries(answers).filter(([, value]) => value !== ""),
      );
      return Promise.resolve(filteredAnswers as T);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  async warn(message: string, defaultValue = false): Promise<boolean> {
    const { proceed } = await this.prompt([
      {
        type: "confirm",
        name: "proceed",
        message,
        default: defaultValue,
      },
    ]);

    return proceed;
  }

  private required(value: string, message: string) {
    if (typeof value === "string" && value.trim() === "") {
      return message;
    }
    return true;
  }

  get validations() {
    return {
      required: this.required,
    };
  }
}

export default Prompt;
