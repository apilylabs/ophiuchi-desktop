"use client";

import { CertificateManager } from "@/helpers/certificate-manager";
import { EndpointManager } from "@/helpers/endpoint-manager";
import { invoke } from "@tauri-apps/api";
import { confirm } from "@tauri-apps/api/dialog";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { appDataDir, resolveResource } from "@tauri-apps/api/path";
import { Command, open as shellOpen } from "@tauri-apps/api/shell";
import { useCallback, useEffect, useState } from "react";
import EndpointAddSideComponent, { EndpointData } from "./add";
import DockerLogModal from "./docker-log";
import EndpointListTable from "./table";

export default function EndpointListComponent() {
  const [loaded, setLoaded] = useState(false);
  const [endpointList, setEndpointList] = useState([]);
  const [openSide, setOpenSide] = useState(false);
  const [dockerModalOpen, setDockerModalOpen] = useState(false);
  const [dockerProcessStream, setDockerProcessStream] = useState("");

  const startDocker = async () => {
    // read file from bundle
    setDockerModalOpen(false);
    const resourcePath = await resolveResource(
      "bundle/templates/docker-compose.yml.template"
    );
    console.log(`resourcePath: ${resourcePath}`);
    const dockerComposeTemplate = await readTextFile(resourcePath);

    setDockerProcessStream(dockerComposeTemplate);
    await writeTextFile(`docker-compose.yml`, dockerComposeTemplate, {
      dir: BaseDirectory.AppData,
    });

    const appDataDirPath = await appDataDir();

    const command = new Command("run-docker-compose", [
      "compose",
      "-v",
      "-f",
      `${appDataDirPath}/docker-compose.yml`,
      "up",
      "-d",
    ]);
    command.on("close", (data) => {
      setDockerProcessStream(
        (prev) =>
          prev +
          `\ncommand finished with code ${data.code} and signal ${data.signal}`
      );
    });
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", (line) =>
      setDockerProcessStream((prev) => prev + `\n${line}`)
    );
    command.stderr.on("data", (line) =>
      setDockerProcessStream((prev) => prev + `\n:${line}`)
    );
    const child = await command.spawn();
    setDockerProcessStream(`command : ${command}`);
    setDockerProcessStream(`command spawned with pid ${child.pid}`);
    setDockerModalOpen(true);
  };

  const onAddCertToKeychain = useCallback(async (endpoint: EndpointData) => {
    const appDataDirPath = await appDataDir();
    const pemFilePath = `${appDataDirPath}cert/${endpoint.hostname}/cert.pem`;
    // support for whitespaces in path
    // const whiteSpaced = pemFilePath.replace(/ /g, "\\ ");
    invoke("add_cert_to_keychain", {
      pem_file_path: `${pemFilePath}`,
    });
    // setPasswordModalOpen(true);
    // setCurrentEndpoint(endpoint);
  }, []);

  const openAppData = useCallback(async () => {
    const appDataDirPath = await appDataDir();
    shellOpen(appDataDirPath);
  }, []);

  const onDeleteEndpoint = useCallback(
    async (endpoint: EndpointData) => {
      const confirmed = await confirm(
        `Are you sure to delete ${endpoint.nickname}?`
      );
      if (!confirmed) {
        return;
      }
      const configHelper = new CertificateManager();
      const endpointManager = EndpointManager.sharedManager();
      invoke("remove_cert_from_keychain", {
        name: `${endpoint.hostname}`,
      });
      configHelper.deleteCertificateFiles(endpoint.hostname);
      configHelper.deleteNginxConfigurationFiles(endpoint.hostname);

      const copiedList = [...endpointList];
      const index = copiedList.findIndex((e: EndpointData) => {
        return e.hostname === endpoint.hostname;
      });
      copiedList.splice(index, 1);

      endpointManager.save(copiedList);
      setEndpointList(copiedList);
    },
    [endpointList]
  );

  const prepareConfigPage = useCallback(async () => {
    const mgr = EndpointManager.sharedManager();
    const list = await mgr.get();
    setEndpointList(list);
    setLoaded(true);
  }, []);

  const addEndpoint = useCallback(async (data: EndpointData) => {
    const mgr = EndpointManager.sharedManager();
    const endpointList = await mgr.get();
    if (endpointList.find((e: EndpointData) => e.hostname === data.hostname)) {
      // already exists
      return;
    }
    endpointList.push(data);
    mgr.save(endpointList);
    setEndpointList(endpointList);
  }, []);

  useEffect(() => {
    prepareConfigPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shouldShowAddButton = loaded;

  return (
    <div className="flex flex-col min-h-screen text-gray-100 bg-gray-900">
      <div className="bg-gray-700 shadow-md">
        <DockerLogModal stream={dockerProcessStream} isOpen={dockerModalOpen} />
        <EndpointAddSideComponent
          open={openSide}
          setOpen={setOpenSide}
          onAdd={(data) => {
            addEndpoint(data);
          }}
        />
        <div className="flex gap-2 px-4 py-4">
          <div
            className="p-2 bg-white text-gray-700 rounded-md cursor-pointer shadow-md hover:bg-gray-200 hover:text-gray-950 text-sm"
            onClick={() => {
              if (endpointList.length === 0) return;
              startDocker();
            }}
          >
            Start Docker
          </div>
          <div
            className="p-2 underline cursor-pointer text-sm"
            onClick={() => {
              openAppData();
            }}
          >
            Open docker-compose folder
          </div>
          <a
            className="p-2 underline cursor-pointer text-sm"
            href={`https://heavenly-tent-fff.notion.site/Ophiuchi-Developers-Toolkit-734dc4f766fe40aebfe0da3cbbc304f5?pvs=4`}
            target="_blank"
          >
            Help
          </a>
        </div>
      </div>

      <div className="p-4">
        <EndpointListTable
          list={endpointList}
          onAddCertToKeychain={onAddCertToKeychain}
          onDeleteEndpoint={onDeleteEndpoint}
          onAddEndpoint={() => {
            setOpenSide(true);
          }}
        />
      </div>
    </div>
  );
}
