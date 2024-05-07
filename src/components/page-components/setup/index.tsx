"use client";

import { SystemHelper } from "@/helpers/system";
// When using the Tauri API npm package:
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import pkg from "../../../../package.json";

const loadTest = async () => {
  const res = await fetch("http://localhost:8899/api/test");
  const data = await res.json();
  console.log(data);
  return data;
};

function randomScentence() {
  const s = [
    "Catching moonbeams...",
    "Harvesting sun rays...",
    "Plucking comet tails...",
    "Collecting cloud whispers...",
    "Snaring cosmic winds...",
    "Scooping up aurora lights...",
    "Trapping nebula echoes...",
    "Seizing twilight shadows...",
    "Drawing in galaxy swirls...",
    "Binding meteor flashes...",
  ];
  return s[Math.floor(Math.random() * s.length)];
}

export function SetupComponent() {
  const [currentJob, setCurrentJob] = useState("");
  const [showNext, setShowNext] = useState(false);

  const onStartApp = useCallback(async () => {
    const s = randomScentence();
    setCurrentJob(s);
    const systemHelper = new SystemHelper();
    await systemHelper.boot();
    setCurrentJob("Loading complete. Click Start.");
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
      <div className="mx-auto max-w-sm w-full">
        <div className="py-4 w-full">
          <h1 className="text-4xl tracking-tight font-semibold text-gray-100">
            Ophiuchi
            <span className="text-xs text-gray-400 ml-3">{pkg.version}</span>
          </h1>
          <p className="text-gray-300 text-sm mt-2">
            SSL Proxy Server Manager for your Localhost Environment
          </p>
        </div>
        <div className="rounded-xl bg-blue-950 px-12 py-8 mt-8 w-full text-center">
          {currentJob}
        </div>
        <div className="mx-auto w-full flex">
          <Link href="/endpoint-list" className="w-full mt-4">
            <Button variant={"default"} disabled={!showNext} className="w-full">
              Start
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
