/* eslint-disable import/prefer-default-export */
/* eslint-disable no-shadow */

import { Environment } from "./config";

export enum VCSProvider {
  GitHub = "GitHub",
}

export type SyncEnvRequest = {
  [key in Environment]?: string;
};
