import { Command } from "commander";
import Storage from "../utils/Storage";
import Logger from "../utils/Logger";
import Prompt from "../utils/Prompt";
import config from "../config";

class BaseCommand {
  command: Command;

  logger = new Logger();

  prompt = new Prompt();

  storage = new Storage();

  config = config;

  constructor(cmd: string) {
    if (new.target === BaseCommand) {
      throw new Error("Cannot instantiate BaseCommand directly");
    }
    this.command = new Command(cmd);
  }

  getCommand() {
    return this.command;
  }
}

export default BaseCommand;
