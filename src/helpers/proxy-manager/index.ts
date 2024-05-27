import {
  BaseDirectory,
  createDir,
  exists,
  readTextFile,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { IFileManagerBase } from "../file-manager";
import { CONFIG_DIR, GROUP_FILE_NAME, PROXY_FILE_NAME } from "./constants";
import { IProxyData, IProxyGroupData } from "./interfaces";
import { m001_createGroupIfNotExists } from "./migration/001-create-group";

let mgr: ProxyManager | undefined = undefined;

export class ProxyManager implements IFileManagerBase {
  constructor() {}

  static sharedManager(): ProxyManager {
    if (!mgr) {
      mgr = new ProxyManager();
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
      await createDir(CONFIG_DIR, { dir, recursive: true });
    }
    // create file if not exist
    const fileExist = await exists(`${CONFIG_DIR}/${PROXY_FILE_NAME}`, { dir });
    if (!fileExist) {
      await writeTextFile(
        `${CONFIG_DIR}/${PROXY_FILE_NAME}`,
        JSON.stringify([]),
        {
          dir,
        }
      );
    }

    await this.migrate();
  }

  async migrate() {
    await m001_createGroupIfNotExists(mgr!);
    return true;
  }

  async getProxies() {
    const dir = this.getBaseDir();
    const fileData = await readTextFile(`${CONFIG_DIR}/${PROXY_FILE_NAME}`, {
      dir,
    });
    const endpointList = JSON.parse(fileData) as IProxyData[];
    return endpointList;
  }

  async getGroups() {
    const dir = this.getBaseDir();
    const fileData = await readTextFile(`${CONFIG_DIR}/${GROUP_FILE_NAME}`, {
      dir,
    });
    const groupList = JSON.parse(fileData) as IProxyGroupData[];
    return groupList;
  }

  async saveGroups(data: IProxyGroupData[]) {
    const dir = this.getBaseDir();

    const cleaned: IProxyGroupData[] = data.map((d) => {
      const cleanedProxyHosts = d.proxyHosts.map((p) => {
        if (typeof p === "object") {
          return (p as IProxyData).hostname;
        }
        return p;
      });
      return {
        ...d,
        updatedAt: new Date().toISOString(),
        proxyHosts: cleanedProxyHosts,
      };
    });
    await writeTextFile(
      `${CONFIG_DIR}/${GROUP_FILE_NAME}`,
      JSON.stringify(cleaned),
      {
        dir,
      }
    );
  }

  async saveProxies(data: any) {
    const dir = this.getBaseDir();
    await writeTextFile(
      `${CONFIG_DIR}/${PROXY_FILE_NAME}`,
      JSON.stringify(data),
      {
        dir,
      }
    );
  }

  async getProxyInGroup(groupName: string) {
    const groups = await this.getGroups();
    const proxies = await this.getProxies();
    const identifiedGroup = groups.filter((p) => p.name === groupName);
    const mapped = identifiedGroup.map((g) => {
      return g.proxyHosts.map((host) => {
        return proxies.find((p) => p.hostname === host);
      });
    });

    console.log(mapped);
    return mapped;
  }
}
