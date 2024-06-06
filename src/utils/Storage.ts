import Configstore from "configstore";
import { APP_FOLDER } from "./constants";

class Storage {
  private store: Configstore;

  constructor(namespace: "app" | "global" | "secret" = "app") {
    this.store = new Configstore(namespace === "app" ? APP_FOLDER : namespace);
  }

  get(key: string) {
    return this.store.get(key);
  }
}

export default Storage;
