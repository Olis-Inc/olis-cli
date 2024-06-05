import { Command } from "commander";
import BaseCommand from "../BaseCommand";

class Env extends BaseCommand {
  constructor() {
    super("env");

    this.command.description("Manage your olis-cli environment variables");
    this.init();
  }

  private init() {
    const syncCommand = new Command("sync");
    syncCommand
      .description("Sync secrets")
      .option(
        "-env --environment <string>",
        "Comma-separated list of environments to sync",
        "production,staging",
      )
      .action((name) => this.logger.log({ name }));

    this.command.addCommand(syncCommand);
  }
}

export default Env;
