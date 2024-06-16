/* eslint-disable import/prefer-default-export */
import { ComputeProvider } from "@src/types/compute";
import Path from "./Path";

const APP_FOLDER = Path.cwd.split("/").pop() || "";
const VCS_PROVIDER = "vcs_provider";
const VCS_ACCESS_TOKEN_KEY = "vcs_access_token";
const VCS_REPOSITORY = "vcs_repository";
const VCS_REPOSITORY_URL = "vcs_repository_url";
const VCS_REPOSITORY_OWNER = "vcs_repository_owner";

// Compute
const STRICTLY_FULLY_MANAGED_PROVIDERS: Array<ComputeProvider> = [
  ComputeProvider.vercel,
];
const STRICTLY_FULLY_MANAGED_PROVIDERS_REGEX = new RegExp(
  `^[${STRICTLY_FULLY_MANAGED_PROVIDERS.join("|")}]`,
);
const VALID_COMPUTE_ID_REGEX = new RegExp(
  `^[${Object.keys(ComputeProvider).join("|")}]`,
);

export {
  APP_FOLDER,
  VCS_ACCESS_TOKEN_KEY,
  VCS_REPOSITORY,
  VCS_REPOSITORY_URL,
  VCS_REPOSITORY_OWNER,
  VCS_PROVIDER,
  STRICTLY_FULLY_MANAGED_PROVIDERS,
  STRICTLY_FULLY_MANAGED_PROVIDERS_REGEX,
  VALID_COMPUTE_ID_REGEX,
};
