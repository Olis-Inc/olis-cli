import { SchemaMap } from "@src/utils/Validator";
import { Environment } from "./config";
import { PromptQuestion } from "./prompt";

export enum ResourceType {
  mongo = "mongo",
}

export enum ResourceItemManagementType {
  managed = "managed",
  self = "self",
}

export type ResourceItemConfigEnv = {
  [key in Exclude<Environment, Environment.local>]: ResourceItemManagementType;
};

export interface ResourceItemConfig {
  env: ResourceItemConfigEnv;
  port: number;
}

export type ResourceConfig = { [key in ResourceType]?: ResourceItemConfig };

export interface Resource<T> {
  name: ResourceType;
  getInputVariables: (
    envConfig: ResourceItemConfigEnv,
    variables?: Record<string, unknown>,
    fxn?: (item: PromptQuestion<T>, i: number) => boolean,
  ) => Promise<Partial<T>>;
  envSchemaMap: SchemaMap;
}
