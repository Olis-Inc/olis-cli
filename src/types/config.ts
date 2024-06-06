import { Option } from "commander";

type Environment = "local" | "staging" | "production";
type MiddlewareType = "database" | "cache" | "search" | "messaging" | "storage";

type Compute = {
  [key in Environment]?: string;
};

type Middleware = {
  [key in MiddlewareType]?: string;
} & { type: string; default?: string };

export interface AppConfig {
  language: string;
  name: string;
  hostname: string;
  subdomain: string;
  template: string;
  environmentFile: string;
  stateStorage: string;
  compute: Compute;
  architecture: string;
  infrastructure: boolean;
  middleware: Array<Middleware>;
}

export interface ConfigOption extends Pick<Option, "flags" | "description"> {
  name: keyof AppConfig;
  type?: "string" | "list" | "rawlist";
  prompt?: {
    message: string;
  };
  default?: unknown;
  choices?: Array<string>;
}
