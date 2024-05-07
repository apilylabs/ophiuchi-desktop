import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { EndpointData } from "@/stores/proxy-list";
import { BaseDirectory, readTextFile, writeTextFile } from "@tauri-apps/api/fs";
import { appDataDir, resolveResource } from "@tauri-apps/api/path";
import { Command } from "@tauri-apps/api/shell";
import { useCallback, useState } from "react";
import DockerLogModal from "../proxy-list/docker-log";

export default function DockerControl({
  endpointList,
}: {
  endpointList: EndpointData[];
}) {
  const [dockerProcessStream, setDockerProcessStream] = useState<any>("");
  const [dockerModalOpen, setDockerModalOpen] = useState(false);
  const [dockerNeedsRestart, setDockerNeedsRestart] = useState(false);

  const appendDockerProcessStream = useCallback((line: any) => {
    if (typeof line === "string") {
      setDockerProcessStream((prev: any) => prev + `\n${line}`);
    } else {
      setDockerProcessStream((prev: any) => prev + line);
    }
  }, []);

  const stopDocker = async () => {
    const appDataDirPath = await appDataDir();
    const command = new Command("stop-docker-compose", [
      "compose",
      "-f",
      `${appDataDirPath}/docker-compose.yml`,
      "down",
    ]);
    command.on("close", (data) => {
      if (data.code == 0) {
        appendDockerProcessStream(`✅ Stopping Docker successfully finished.`);
      } else {
        appendDockerProcessStream(
          `🚨 Stopping Docker failed with code ${data.code} and signal ${data.signal}`
        );
      }
      appendDockerProcessStream("💤 Waiting for docker to settle...");
    });
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", (line) => appendDockerProcessStream(`${line}`));
    command.stderr.on("data", (line) => appendDockerProcessStream(`${line}`));
    const child = await command.spawn();
    setDockerProcessStream(`👉 Stopping Docker...`);
  };

  const startDocker = async () => {
    setDockerModalOpen(true);
    setDockerNeedsRestart(false);

    await stopDocker();

    await new Promise((resolve) => setTimeout(resolve, 2500));

    const resourcePath = await resolveResource(
      "bundle/templates/docker-compose.yml.template"
    );
    console.log(`resourcePath: ${resourcePath}`);
    const dockerComposeTemplate = await readTextFile(resourcePath);

    appendDockerProcessStream(`👉 Starting Docker...`);
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
      if (data.code == 0) {
        appendDockerProcessStream(`✅ Starting Docker successfully finished.`);
      } else {
        appendDockerProcessStream(
          `🚨 Starting Docker failed with code ${data.code} and signal ${data.signal}`
        );
      }
    });
    command.on("error", (error) => console.error(`command error: "${error}"`));
    command.stdout.on("data", (line) => appendDockerProcessStream(`${line}`));
    command.stderr.on("data", (line) => appendDockerProcessStream(`${line}`));
    const child = await command.spawn();
    appendDockerProcessStream(`command spawned with pid ${child.pid}`);
  };

  return (
    <>
      <Button
        variant={"default"}
        onClick={() => {
          if (endpointList.length === 0) {
            return;
          }
          startDocker();
        }}
        className={cn(dockerNeedsRestart ? "animate-bounce" : "")}
        disabled={endpointList.length === 0}
      >
        {dockerNeedsRestart ? "Restart Docker To Apply" : "Start Docker "}
      </Button>
      <DockerLogModal
        stream={dockerProcessStream}
        isOpen={dockerModalOpen}
        onClosed={() => {
          setDockerModalOpen(false);
        }}
      />
    </>
  );
}
