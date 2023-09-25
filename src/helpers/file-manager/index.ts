import { BaseDirectory } from "@tauri-apps/api/fs";

export interface IFileManagerBase {
  boot: () => Promise<void>;
  getBaseDir: () => BaseDirectory;
  migrate: () => Promise<boolean>;
  get: () => Promise<any>;
  save: (data: any) => Promise<any>;
}
