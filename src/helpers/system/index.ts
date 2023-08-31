import {
  BaseDirectory,
  createDir,
  exists,
  writeTextFile,
} from "@tauri-apps/api/fs";

export class SystemHelper {
  private dir: BaseDirectory;
  constructor() {
    this.dir = BaseDirectory.AppData;
  }

  async boot() {
    const dir = this.dir;
    const appDataPathExists = await exists("", { dir });
    if (!appDataPathExists) {
      await createDir("", { dir });
    }

    if (!(await exists("Config", { dir }))) {
      await createDir("Config", { dir });
    }

    if (!(await exists("Config/app.config.json", { dir }))) {
      await writeTextFile(
        "Config/app.config.json",
        JSON.stringify({ booted: true }),
        { dir }
      );
    }

    if (!(await exists("Config/app.endpoint.json", { dir }))) {
      await writeTextFile("Config/app.endpoint.json", JSON.stringify([]), {
        dir,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 4000));
  }
}
