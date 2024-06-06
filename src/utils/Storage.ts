import Configstore from "configstore";
import { APP_FOLDER } from "./constants";

class Storage {
  private store: Configstore;

  constructor(scope: "app" | "global" = "app") {
    this.store = new Configstore(scope === "app" ? APP_FOLDER : "global");
  }

  get(key: string) {
    return this.store.get(key);
  }
}

export default Storage;
