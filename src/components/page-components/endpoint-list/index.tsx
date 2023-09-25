"use client";

import { CertificateManager } from "@/helpers/certificate-manager";
import { EndpointManager } from "@/helpers/endpoint-manager";
import { confirm } from "@tauri-apps/api/dialog";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { appDataDir, resolveResource } from "@tauri-apps/api/path";
import { Command, open as shellOpen } from "@tauri-apps/api/shell";
import { useCallback, useEffect, useState } from "react";
import EndpointAddSideComponent, { EndpointData } from "./add";
import DockerLogModal from "./docker-log";

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
    // open
    const appDataDirPath = await appDataDir();
    const pemFilePath = `${appDataDirPath}/cert/${endpoint.hostname}/cert.pem`;
    await shellOpen(pemFilePath);
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
      configHelper.deleteCertificateFiles(endpoint.hostname);
      configHelper.deleteNginxConfigurationFiles(endpoint.hostname);

      const index = endpointList.findIndex((e: EndpointData) => {
        return e.nickname === endpoint.nickname;
      });
      endpointList.splice(index, 1);

      endpointManager.save(endpointList);
      setEndpointList(endpointList);
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
    <div className="flex flex-col min-h-screen py-2 text-gray-100 bg-gray-900">
      <DockerLogModal stream={dockerProcessStream} isOpen={dockerModalOpen} />
      <EndpointAddSideComponent
        open={openSide}
        setOpen={setOpenSide}
        onAdd={(data) => {
          addEndpoint(data);
        }}
      />
      <div className="flex gap-2 p-4">
        <div
          className="p-2 bg-white text-gray-700 rounded-md cursor-pointer hover:bg-gray-100 text-sm"
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
      </div>
      <div className="p-4">
        <h1 className="text-2xl">Endopoint List</h1>
      </div>

      <div className="p-4">
        <table className="table-auto border-separate border border-gray-500 w-full">
          <thead>
            <tr>
              <th className="border border-gray-600">Nickname</th>
              <th className="border border-gray-600">Hostname</th>
              <th className="border border-gray-600">Port</th>
              <th className="border border-gray-600">Actions</th>
              <th className="border border-gray-600">Manage</th>
            </tr>
          </thead>
          <tbody>
            {endpointList.map((endpoint: any, index) => {
              return (
                <tr key={index} className="text-center">
                  <td className="border border-gray-800">
                    {endpoint.nickname}
                  </td>
                  <td className="border border-gray-800">
                    {endpoint.hostname}
                  </td>
                  <td className="border border-gray-800">{endpoint.port}</td>
                  <td
                    className="border border-gray-800 cursor-pointer underline"
                    onClick={() => {
                      onAddCertToKeychain(endpoint);
                    }}
                  >
                    Add Cert to keychain
                  </td>
                  <td
                    className="border border-gray-800 cursor-pointer underline"
                    onClick={() => {
                      onDeleteEndpoint(endpoint);
                    }}
                  >
                    Delete
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {shouldShowAddButton && (
          <div className="py-4">
            <button
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 text-sm"
              onClick={() => {
                setOpenSide(true);
              }}
            >
              Add Endpoint
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
