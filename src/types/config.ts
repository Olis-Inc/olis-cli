import { ResourceConfig } from "./resource";

export enum Environment {
  local = "local",
  staging = "staging",
  production = "production",
}

export type ComputeConfig = {
  [key in Exclude<Environment, Environment.local>]: string;
};

export enum Framework {
  Javascript = "Javascript",
  ReactNative = "ReactNative",
}

export enum StateStorage {
  local = "local",
}

export type Architecture = "none" | string;

export interface AppConfig {
  framework?: Framework;
  name: string;
  hostname?: string;
  subdomain?: string;
  // template: string; // Not quite ready for this, but you can create from template github
  environmentFile: string;
  stateStorage: StateStorage;
  compute: ComputeConfig;
  architecture: Architecture;
  infrastructure: boolean;
  resources: ResourceConfig;
  manageRepository: boolean;
}
