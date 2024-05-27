import { createDir, exists, writeTextFile } from "@tauri-apps/api/fs";
import { ProxyManager } from "..";
import {
  CONFIG_DIR,
  DEFAULT_PROXY_GROUP_ID,
  DEFAULT_PROXY_GROUP_NAME,
  GROUP_FILE_NAME,
} from "../constants";
import { IProxyGroupData } from "../interfaces";

export async function m001_createGroupIfNotExists(mgrInstance: ProxyManager) {
  const dir = mgrInstance.getBaseDir();
  const dirExist = await exists(CONFIG_DIR, { dir });
  if (!dirExist) {
    await createDir(CONFIG_DIR, { dir, recursive: true });
  }
  // create group file if not exists
  const fileExist = await exists(`${CONFIG_DIR}/${GROUP_FILE_NAME}`, { dir });
  if (!fileExist) {
    const proxies = await mgrInstance.getProxies();
    const defaultGroup: IProxyGroupData = {
      id: DEFAULT_PROXY_GROUP_ID,
      name: DEFAULT_PROXY_GROUP_NAME,
      proxyHosts: proxies.map((p) => p.hostname),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await writeTextFile(
      `${CONFIG_DIR}/${GROUP_FILE_NAME}`,
      JSON.stringify([defaultGroup]),
      {
        dir,
      }
    );
  }
}
