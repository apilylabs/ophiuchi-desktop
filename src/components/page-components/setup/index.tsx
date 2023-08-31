"use client";

// When using the Tauri API npm package:
import {
  BaseDirectory,
  createDir,
  exists,
  readDir,
  writeTextFile,
} from "@tauri-apps/api/fs";
import { invoke } from "@tauri-apps/api/tauri";
import { useCallback, useEffect, useState } from "react";
// Write a text file to the `$APPCONFIG/app.conf` path

const onStartServer = () => {
  // Invoke the command
  invoke("my_custom_command");
};
const loadTest = async () => {
  const res = await fetch("http://localhost:8899/api/test");
  const data = await res.json();
  console.log(data);
  return data;
};

export function SetupComponent() {
  const [currentJob, setCurrentJob] = useState("Loading...");
  useEffect(() => {
    onStartApp();
  }, []);

  const onStartApp = useCallback(async () => {
    const dir = BaseDirectory.AppData;
    setCurrentJob("Gathering star dust...");

    const appDataPathExists = await exists("", {
      dir,
    });

    console.log(appDataPathExists);
    if (!appDataPathExists) {
      await createDir("", {
        dir,
      });
    }
    const dirList = await readDir("", {
      dir,
      recursive: true,
    });
    console.log(dirList);

    const res = await writeTextFile("app.conf", "file contents", {
      dir,
    });
    console.log(res);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-gray-100 bg-gray-900">
      <div className="py-4">
        <h1 className="text-2xl tracking-tight font-semibold text-gray-300">
          Ophiuchi
        </h1>
        <p className="text-gray-400 text-sm">
          Setting up configuration for app.
        </p>
      </div>
      <div className="rounded-xl bg-blue-950 p-12">{currentJob}</div>
    </div>
  );
}
