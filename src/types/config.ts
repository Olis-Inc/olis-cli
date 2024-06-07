export enum Environment {
  local = "local",
  staging = "staging",
  production = "production",
}

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

export enum StateStorage {
  local = "local",
}

export interface AppConfig {
  framework?: string;
  name: string;
  hostname?: string;
  subdomain?: string;
  // template: string; // Not quite ready for this, but you can create from template github
  environmentFile: string;
  stateStorage: StateStorage;
  compute: Compute;
  architecture?: string;
  infrastructure: boolean;
  middleware: Array<Middleware>;
  manageRepository: boolean;
}
