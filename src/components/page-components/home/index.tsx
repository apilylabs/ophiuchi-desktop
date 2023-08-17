"use client";

// When using the Tauri API npm package:
import { invoke } from "@tauri-apps/api/tauri";
import { useEffect } from "react";
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

export function HomeComponent() {
  useEffect(() => {
    loadTest();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-gray-100 bg-blue-950">
      <div className="rounded-xl bg-blue-900 p-10">
        <div className="flex flex-col gap-8 w-full max-w-sm">
          <div className="">
            <h1 className="text-2xl tracking-tight font-semibold text-blue-300">
              Ophiuchi
            </h1>
            <p className="text-blue-400 text-sm">
              Start your local HTTPS proxy server with docker.
            </p>
          </div>
          <div className="flex flex-col">
            <label>HOSTNAME</label>
            <input
              type="text"
              className="p-2 bg-transparent border-b border-b-blue-600 caret-blue-600"
              placeholder="hostname (ex:local.domain.com)"
            />
          </div>
          <div className="flex flex-col">
            <label>PORT</label>
            <input
              type="text"
              className="p-2 bg-transparent border-b border-b-blue-600 caret-blue-600"
              placeholder="proxy port number (ex:3000)"
            />
          </div>
          <div className="">
            <button
              className="px-4 py-2 text-white bg-blue-600 rounded-lg"
              onClick={() => {
                onStartServer();
              }}
            >
              Start Docker Server
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
