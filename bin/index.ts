#!/usr/bin/env node
import { program } from "commander";
import init from "../src/commands/init";
import secrets from "../src/commands/secrets";
import deployment from "../src/commands/deployment";
import env from "../src/commands/env";

program
  .name("Olis CLI")
  .description(
    "A command-line interface app that helps get your projects up to speed without leaving your code editor",
  )
  .version("0.0.0")
  .addCommand(init.getCommand())
  .addCommand(secrets.getCommand())
  .addCommand(deployment.getCommand())
  .addCommand(env.getCommand());

program.parse(process.argv);
