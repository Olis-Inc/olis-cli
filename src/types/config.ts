import { Option } from "commander";

type Environment = "local" | "staging" | "production";
type MiddlewareType = "database" | "cache" | "search" | "messaging" | "storage";

type Compute = {
  [key in Environment]?: string;
};

type Middleware = {
  [key in MiddlewareType]?: string;
} & { type: string; default?: string };

export enum Framework {
  Javascript = "Javascript",
  ReactNative = "ReactNative",
}

export interface AppConfig {
  framework?: string;
  name: string;
  hostname?: string;
  subdomain?: string;
  // template: string; // Not quite ready for this
  environmentFile: string;
  stateStorage: string;
  compute: Compute;
  architecture?: string;
  infrastructure: boolean;
  middleware: Array<Middleware>;
  manageRepository: boolean;
}

export interface ConfigOption extends Pick<Option, "flags" | "description"> {
  name: keyof AppConfig;
  type?: "string" | "list" | "rawlist" | "confirm";
  prompt?: {
    message: string;
  };
  default?: unknown;
  choices?: Array<string>;
}
