import { Environment } from "./config";

export enum ComputeProvider {
  none = "none",
  aws = "aws",
  vercel = "vercel",
}

export type ComputeConfig = {
  [key in Exclude<Environment, Environment.local>]: string;
};
