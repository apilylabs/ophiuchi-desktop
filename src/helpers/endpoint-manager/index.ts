import {
  BaseDirectory,
  createDir,
  exists,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { IFileManagerBase } from "../file-manager";

const CONFIG_DIR = "Config";
const FILE_NAME = "app.endpoint.json";

let mgr: any = undefined;

export class EndpointManager implements IFileManagerBase {
  constructor() {}

  static sharedManager(): EndpointManager {
    if (!mgr) {
      mgr = new EndpointManager();
    }
    return mgr;
  }

  getBaseDir() {
    return BaseDirectory.App;
  }

  async boot() {
    const dir = this.getBaseDir();
    const dirExist = await exists(CONFIG_DIR, { dir });
    if (!dirExist) {
      await createDir(CONFIG_DIR, { dir });
    }
    // create file if not exist
    const fileExist = await exists(`${CONFIG_DIR}/${FILE_NAME}`, { dir });
    if (!fileExist) {
      await writeTextFile(`${CONFIG_DIR}/${FILE_NAME}`, JSON.stringify([]), {
        dir,
      });
    }
  }

  async migrate() {
    const bool: boolean = await new Promise((resolve, reject) => {
      resolve(true);
    });
    return bool;
  }

  async get() {
    const dir = this.getBaseDir();
    const fileData = await readTextFile(`${CONFIG_DIR}/${FILE_NAME}`, {
      dir,
    });
    const endpointList = JSON.parse(fileData);
    return endpointList;
  }

  async save(data: any) {
    const dir = this.getBaseDir();
    await writeTextFile(`${CONFIG_DIR}/${FILE_NAME}`, JSON.stringify(data), {
      dir,
    });
  }
}
