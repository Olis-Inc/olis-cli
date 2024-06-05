import Path from "../../utils/Path";
import BaseCommand from "../BaseCommand";

class Init extends BaseCommand {
  private defaultAppName: string | undefined = Path.cwd.split("/").pop();

  constructor() {
    super("init");
    this.init();
  }

  private init() {
    this.command = this.command
      .description("Initialize Project with olis-cli")
      .argument("[string]", "Name of App", this.defaultAppName)
      .option("-lang, --language [string]", "Language associated with App")
      .option("-d, --domain [string]", "Domain of App")
      .option("-s, --subdomain [string]", "Subdomain of App")
      .option("-t, --template [string]", "Template of app to clone")
      .option("-repo, --repository [string]", "Repository of app")
      .option(
        "-infra, --infrastructure [string]",
        "Whether to add infrastructure code",
        true,
      )
      .option(
        "-env-file, --environment-file [string]",
        "Path to environment file",
        ".env",
      )
      .option(
        "-ss, --state-store [string]",
        "State store for infrastructure config",
        "local",
      )
      .option(
        "-a, --architecture [string]",
        "Infrastructural Architecture of App/Project",
      )
      .action((name, options) => this.logger.log({ name, options }));
  }
}

export default Init;
