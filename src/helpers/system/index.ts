import {
  BaseDirectory,
  createDir,
  exists,
  writeTextFile,
} from "@tauri-apps/api/fs";

export const CONFIG_PATH = "Config";
export const CONFIG_FILENAME = "app.config.json";
export const CONFIG_ENDPOINTS_FILENAME = "app.endpoint.json";

export class SystemHelper {
  private dir: BaseDirectory;
  constructor() {
    this.dir = BaseDirectory.AppData;
  }

  private async prepDirs() {
    const dir = this.dir;
    const appDataPathExists = await exists("", { dir });
    if (!appDataPathExists) {
      await createDir("", { dir });
    }

    if (!(await exists(CONFIG_PATH, { dir }))) {
      await createDir(CONFIG_PATH, { dir });
    }
  }

  private async prepConfig() {
    const dir = this.dir;
    const configFilePath = `${CONFIG_PATH}/${CONFIG_FILENAME}`;
    if (!(await exists(configFilePath, { dir }))) {
      await writeTextFile(configFilePath, JSON.stringify({ booted: true }), {
        dir,
      });
    }
  }

  private async prepEndpointsConfig() {
    const dir = this.dir;
    const configEndpointsFilePath = `${CONFIG_PATH}/${CONFIG_ENDPOINTS_FILENAME}`;
    if (!(await exists(configEndpointsFilePath, { dir }))) {
      await writeTextFile(configEndpointsFilePath, JSON.stringify([]), {
        dir,
      });
    }
  }

  async boot() {
    await this.prepDirs();
    await this.prepConfig();
    await this.prepEndpointsConfig();
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }
}
