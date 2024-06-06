import { Command } from "commander";
import BaseCommand from "../BaseCommand";

class Middleware extends BaseCommand {
  constructor() {
    super("middleware");

    this.command.description("Manage your olis-cli middleware");
    this.init();
  }

  private init() {
    const addCommand = new Command("add");
    addCommand
      .description("Add middleware")
      .argument("<string>", "Middleware to add")
      .action((middleware) => {
        this.add(middleware);
      });

    const deleteCommand = new Command("delete");
    deleteCommand
      .description("Delete middleware")
      .argument("<string>", "Middleware to delete")
      .action((middleware) => {
        this.delete(middleware);
      });

    this.command.addCommand(addCommand);
    this.command.addCommand(deleteCommand);
  }

  private add(name: string) {
    try {
      this.logger.log(name);
      // Check middleware to see if it exists
      // Get middleware variables
      // For each of them, compose questions to ask
      // Save to config file
      // Echo variables
    } catch (error) {
      this.logger.error(error);
    }
  }

  private delete(name: string) {
    try {
      this.logger.log(name);
      // Check middleware to see if it exists
      // Delete middleware for file system
      // Save to config file
    } catch (error) {
      this.logger.error(error);
    }
  }
}

export default Middleware;
