/* eslint-disable import/prefer-default-export */
import Path from "./Path";

const APP_FOLDER = Path.cwd.split("/").pop() || "";
const VCS_ACCESS_TOKEN_KEY = "vcs_access_token";
const VCS_REPOSITORY_KEY = "vcs_repository";
const VCS_REPOSITORY_URL = "vcs_repository_url";
const VCS_REPOSITORY_OWNER = "vcs_repository_owner";

export {
  APP_FOLDER,
  VCS_ACCESS_TOKEN_KEY,
  VCS_REPOSITORY_KEY,
  VCS_REPOSITORY_URL,
  VCS_REPOSITORY_OWNER,
};
