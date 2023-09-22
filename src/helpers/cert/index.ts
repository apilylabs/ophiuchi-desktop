import {
  BaseDirectory,
  createDir,
  exists,
  readTextFile,
  removeDir,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { resolveResource } from "@tauri-apps/api/path";
import * as selfsigned from "selfsigned";

export class ConfigurationHelper {
  async deleteCertificateFiles(hostname: string) {
    await removeDir(`cert/${hostname}`, {
      dir: BaseDirectory.AppData,
      recursive: true,
    });
  }

  async deleteConfigurationFiles(hostname: string) {
    await removeDir(`conf/conf.d/${hostname}.conf`, {
      dir: BaseDirectory.AppData,
      recursive: true,
    });
  }

  async generateConfigurationFiles(hostname: string, port: number) {
    // save to file
    if (
      !(await exists(`conf/conf.d`, {
        dir: BaseDirectory.AppData,
      }))
    ) {
      await createDir(`conf/conf.d`, {
        dir: BaseDirectory.AppData,
        recursive: true,
      });
    }

    // read nginx conf file from bundle
    const nginxDefaultConfigPath = await resolveResource(
      "bundle/templates/default.nginx.conf.template"
    );
    const nginxDefaultConfigTemplate = await readTextFile(
      nginxDefaultConfigPath
    );

    await writeTextFile(`conf/nginx.conf`, nginxDefaultConfigTemplate, {
      dir: BaseDirectory.AppData,
    });

    // read nginx file from bundle
    const nginxConfigPath = await resolveResource(
      "bundle/templates/server.conf.template"
    );
    const nginxConfigTemplate = await readTextFile(nginxConfigPath);

    // replace all occurences of {DOMAIN_NAME} with hostname
    const nginxConfig = nginxConfigTemplate.replace(/{DOMAIN_NAME}/g, hostname);
    // replace all occurences of {PORT} with port
    const nginxConfigWithPort = nginxConfig.replace(/{PORT}/g, port.toString());

    await writeTextFile(`conf/conf.d/${hostname}.conf`, nginxConfigWithPort, {
      dir: BaseDirectory.AppData,
    });
  }
  constructor() {
    // init
  }

  public async generateCertificate(hostname: string) {
    var attrs = [{ name: "commonName", value: hostname }];
    interface IPems {
      private: string;
      public: string;
      cert: string;
    }
    const pems: IPems = await new Promise((resolve) => {
      var pems = selfsigned.generate(attrs, {
        days: 3650,
        algorithm: "sha256",
        keySize: 2048,
        extensions: [
          {
            name: "subjectAltName",
            altNames: [
              { type: 2, value: hostname },
              { type: 7, ip: "127.0.0.1" },
            ],
          },
        ],
        pkcs7: true, // include PKCS#7 as part of the output (default: false) });
      });
      resolve(pems);
    });

    // save to file
    if (
      !(await exists(`cert/${hostname}`, {
        dir: BaseDirectory.AppData,
      }))
    ) {
      await createDir(`cert/${hostname}`, {
        dir: BaseDirectory.AppData,
        recursive: true,
      });
    }

    // write public
    await writeTextFile(`cert/${hostname}/public.crt`, pems.public, {
      dir: BaseDirectory.AppData,
    });

    // write key
    await writeTextFile(`cert/${hostname}/private.key`, pems.private, {
      dir: BaseDirectory.AppData,
    });

    // write cert
    await writeTextFile(`cert/${hostname}/cert.pem`, pems.cert, {
      dir: BaseDirectory.AppData,
    });

    return pems;
  }
}
