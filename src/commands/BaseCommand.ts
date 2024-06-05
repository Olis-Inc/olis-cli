import { Command } from "commander";
import Logger from "../utils/Logger";

class BaseCommand {
  command: Command;

  logger = Logger;

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
