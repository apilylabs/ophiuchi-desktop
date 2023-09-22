"use client";

import { ConfigurationHelper } from "@/helpers/cert";
import { confirm } from "@tauri-apps/api/dialog";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { appDataDir, resolveResource } from "@tauri-apps/api/path";
import { Command, open as shellOpen } from "@tauri-apps/api/shell";
import { useCallback, useEffect, useState } from "react";
import EndpointAddSideComponent, { EndpointData } from "./add";

export default function EndpointListComponent() {
  const [loaded, setLoaded] = useState(false);
  const [endpointList, setEndpointList] = useState([]);
  const [openSide, setOpenSide] = useState(false);

  const startDocker = async () => {
    // read file from bundle
    const resourcePath = await resolveResource(
      "bundle/templates/docker-compose.yml.template"
    );
    const dockerComposeTemplate = await readTextFile(resourcePath);

    await writeTextFile(`docker-compose.yml`, dockerComposeTemplate, {
      dir: BaseDirectory.AppData,
    });

    const appDataDirPath = await appDataDir();

    const command = new Command("run-docker-compose", [
      "compose",
      "-f",
      `${appDataDirPath}/docker-compose.yml`,
      "up",
      "-d",
    ]);
    command.on("close", (data) => {
      console.log(
        `command finished with code ${data.code} and signal ${data.signal}`
      );
    });
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", (line) =>
      console.log(`command stdout: "${line}"`)
    );
    command.stderr.on("data", (line) =>
      console.log(`command stderr: "${line}"`)
    );
    const child = await command.spawn();
    console.log("pid:", child.pid);
  };

  const onAddCertToKeychain = useCallback(async (endpoint: EndpointData) => {
    // open
    const appDataDirPath = await appDataDir();
    const pemFilePath = `${appDataDirPath}/cert/${endpoint.hostname}/cert.pem`;
    await shellOpen(pemFilePath);
  }, []);

  const onDeleteEndpoint = useCallback(async (endpoint: EndpointData) => {
    const confirmed = await confirm(
      `Are you sure to delete ${endpoint.nickname}?`
    );
    if (!confirmed) {
      return;
    }
    const configHelper = new ConfigurationHelper();
    configHelper.deleteCertificateFiles(endpoint.hostname);
    configHelper.deleteConfigurationFiles(endpoint.hostname);

    const dir = BaseDirectory.AppData;
    const fileData = await readTextFile("Config/app.endpoint.json", {
      dir,
    });
    const endpointList = JSON.parse(fileData);
    // delete from list
    const index = endpointList.findIndex((e: EndpointData) => {
      return e.nickname === endpoint.nickname;
    });
    endpointList.splice(index, 1);
    // write to file
    await writeTextFile(
      "Config/app.endpoint.json",
      JSON.stringify(endpointList),
      {
        dir,
      }
    );
    setEndpointList(endpointList);
  }, []);

  const prepareConfigPage = useCallback(async () => {
    const dir = BaseDirectory.AppData;

    const fileData = await readTextFile("Config/app.endpoint.json", {
      dir,
    });
    console.log(fileData);
    setEndpointList(JSON.parse(fileData));
    setLoaded(true);
  }, []);

  const addEndpoint = useCallback(async (data: EndpointData) => {
    const dir = BaseDirectory.AppData;
    const fileData = await readTextFile("Config/app.endpoint.json", {
      dir,
    });
    const endpointList = JSON.parse(fileData);
    endpointList.push(data);
    await writeTextFile(
      "Config/app.endpoint.json",
      JSON.stringify(endpointList),
      {
        dir,
      }
    );
    setEndpointList(endpointList);
  }, []);

  useEffect(() => {
    prepareConfigPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shouldShowAddButton = loaded;

  return (
    <div className="flex flex-col min-h-screen py-2 text-gray-100 bg-gray-900">
      <EndpointAddSideComponent
        open={openSide}
        setOpen={setOpenSide}
        onAdd={(data) => {
          addEndpoint(data);
        }}
      />
      <div className="p-4">
        <h1 className="text-2xl">Endopoint List</h1>
      </div>
      <div
        className="p-4 underline cursor-pointer"
        onClick={() => {
          startDocker();
        }}
      >
        Start Docker
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
          <div className="p-4">
            <button
              className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600"
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
