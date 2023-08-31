"use client";

import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { useCallback, useEffect, useState } from "react";
import EndpointAddSideComponent, { EndpointData } from "./add";

export default function EndpointListComponent() {
  const [loaded, setLoaded] = useState(false);
  const [endpointList, setEndpointList] = useState([]);
  const [openSide, setOpenSide] = useState(false);

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
      <div className="p-4">
        <table className="table-auto border-separate border border-gray-500 w-full">
          <thead>
            <tr>
              <th className="border border-gray-600">Nickname</th>
              <th className="border border-gray-600">Hostname</th>
              <th className="border border-gray-600">Port</th>
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
                  <td className="border border-gray-800">Edit</td>
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
