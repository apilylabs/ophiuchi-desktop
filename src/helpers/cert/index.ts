import {
  BaseDirectory,
  createDir,
  exists,
  writeTextFile,
} from "@tauri-apps/api/fs";
import * as selfsigned from "selfsigned";

export class CertificateHelper {
  constructor() {
    // init
  }

  public async generateCertificate(hostname: string) {
    var attrs = [{ name: "commonName", value: hostname }];
    var pems = selfsigned.generate(attrs, { days: 365 });

    // save to file
    if (
      !(await exists(`certs/${hostname}`, {
        dir: BaseDirectory.AppData,
      }))
    ) {
      await createDir(`certs/${hostname}`, {
        dir: BaseDirectory.AppData,
        recursive: true,
      });
    }

    // write cert
    await writeTextFile(`certs/${hostname}/cert.crt`, pems.cert, {
      dir: BaseDirectory.AppData,
    });

    // write key
    await writeTextFile(`certs/${hostname}/private.key`, pems.private, {
      dir: BaseDirectory.AppData,
    });

    // write public
    await writeTextFile(`certs/${hostname}/public.pem`, pems.public, {
      dir: BaseDirectory.AppData,
    });

    return pems;
  }
}
