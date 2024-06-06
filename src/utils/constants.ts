/* eslint-disable import/prefer-default-export */
import Path from "./Path";

const APP_FOLDER = Path.cwd.split("/").pop() || "";
export { APP_FOLDER };
