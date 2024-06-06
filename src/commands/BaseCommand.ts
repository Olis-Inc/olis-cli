import { Command } from "commander";
import BuildManager from "@src/build";
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

  buildManager = new BuildManager();

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
