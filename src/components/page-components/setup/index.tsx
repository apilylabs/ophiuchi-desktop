"use client";

import { SystemHelper } from "@/helpers/system";
// When using the Tauri API npm package:
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

const loadTest = async () => {
  const res = await fetch("http://localhost:8899/api/test");
  const data = await res.json();
  console.log(data);
  return data;
};

export function SetupComponent() {
  const [currentJob, setCurrentJob] = useState("");
  const [showNext, setShowNext] = useState(false);

  const onStartApp = useCallback(async () => {
    setCurrentJob("Gathering star dust...");
    const systemHelper = new SystemHelper();
    await systemHelper.boot();
    setCurrentJob("Gathering star dust... Done!");
    setShowNext(true);
  }, []);

  useEffect(() => {
    if (showNext === false) {
      onStartApp();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showNext]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-2 text-gray-100 bg-gray-900">
      <div className="py-4">
        <h1 className="text-2xl tracking-tight font-semibold text-gray-300">
          Ophiuchi
        </h1>
        <p className="text-gray-400 text-sm">
          Setting up configuration for you.
        </p>
      </div>
      <div className="rounded-xl bg-blue-950 p-12">{currentJob}</div>
      {showNext && (
        <Link
          href="/endpoint-list"
          className="bg-white rounded-lg px-4 py-2 text-black my-4"
        >
          Start
        </Link>
      )}
    </div>
  );
}
