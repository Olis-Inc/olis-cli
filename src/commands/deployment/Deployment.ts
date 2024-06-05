import { Command } from "commander";
import BaseCommand from "../BaseCommand";

class Deployment extends BaseCommand {
  constructor() {
    super("deployment");

    this.command.description("Manage your olis-cli deployment");
    this.init();
  }

  private init() {
    const destroyCommand = new Command("destroy");
    destroyCommand
      .description("Destroy deployment")
      .option("-a --auto-approve <boolean>", "Auto Approve", false)
      .action((options) => this.logger.log(options));

    const statusCommand = new Command("status");
    statusCommand
      .description("Get status of deployment")
      .option(
        "-a --async <boolean>",
        "Whether to monitor status of deployment",
        false,
      )
      .action((options) => this.logger.log(options));

    this.command.addCommand(destroyCommand);
    this.command.addCommand(statusCommand);
  }
}

export default Deployment;
