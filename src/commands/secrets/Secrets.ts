import { Command } from "commander";
import BaseCommand from "../BaseCommand";

class Secrets extends BaseCommand {
  constructor() {
    super("secrets");

    this.command.description("Manage your olis-cli secrets");
    this.init();
  }

  private init() {
    const addCommand = new Command("add");
    addCommand
      .description("Add a secret")
      .argument("<string>", "Name of Secret")
      .argument("<string>", "Value of Secret")
      .action((name, value) => this.logger.log({ name, value }));

    const updateCommand = new Command("update");
    updateCommand
      .description("Update a secret")
      .argument("<string>", "Name of Secret")
      .argument("<string>", "Value of Secret")
      .action((name, value) => this.logger.log({ name, value }));

    const deleteCommand = new Command("delete");
    deleteCommand
      .description("Delete a secret")
      .argument("<string>", "Name of Secret")
      .action((name) => this.logger.log({ name }));

    this.command.addCommand(addCommand);
    this.command.addCommand(updateCommand);
    this.command.addCommand(deleteCommand);
  }
}

export default Secrets;
