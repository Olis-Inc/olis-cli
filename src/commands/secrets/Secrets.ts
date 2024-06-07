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
      .action((name, value) => {
        this.add(name, value);
      });

    const updateCommand = new Command("update");
    updateCommand
      .description("Update a secret")
      .argument("<string>", "Name of Secret")
      .argument("<string>", "Value of Secret")
      .action((name, value) => {
        this.update(name, value);
      });

    const deleteCommand = new Command("delete");
    deleteCommand
      .description("Delete a secret")
      .argument("<string>", "Name of Secret")
      .action((name) => {
        this.delete(name);
      });

    this.command.addCommand(addCommand);
    this.command.addCommand(updateCommand);
    this.command.addCommand(deleteCommand);
  }

  private add(name: string, value: string) {
    this.secureStorage.set(name, value);
    this.logger.success(`Secret ${name} added successfully!`);
  }

  private update(name: string, value: string) {
    this.secureStorage.set(name, value);
    this.logger.success(`Secret ${name} updated successfully!`);
  }

  private delete(name: string) {
    this.secureStorage.delete(name);
    this.logger.success(`Secret ${name} deleted successfully!`);
  }
}

export default Secrets;
