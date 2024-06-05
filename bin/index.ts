#!/usr/bin/env node
import { program } from "commander";

program.option("-n, --name <type>", "Add your name").action((options) => {
  // eslint-disable-next-line no-console
  console.log(`Hey homie, señorr`, options.name);
});

program.parse(process.argv);
