import { BaseDirectory } from "@tauri-apps/api/fs";
import { EndpointManager } from "../endpoint-manager";

export const CONFIG_PATH = "Config";
export const CONFIG_FILENAME = "app.config.json";
export const CONFIG_ENDPOINTS_FILENAME = "app.endpoint.json";

export class SystemHelper {
  private dir: BaseDirectory;
  constructor() {
    this.dir = BaseDirectory.AppData;
  }

  async boot() {
    EndpointManager.sharedManager();
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
