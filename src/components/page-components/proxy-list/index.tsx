"use client";

import DiscordIcon from "@/components/icons/discord";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CertificateManager } from "@/helpers/certificate-manager";
import { EndpointManager } from "@/helpers/endpoint-manager";
import proxyListStore, { EndpointData } from "@/stores/proxy-list";
import { invoke } from "@tauri-apps/api";
import { confirm } from "@tauri-apps/api/dialog";
import { appDataDir } from "@tauri-apps/api/path";
import { open as shellOpen } from "@tauri-apps/api/shell";
import { useCallback, useEffect, useState } from "react";
import DockerControl from "../docker-control";
import CreateProxyV2SideComponent from "./add-new";
import RequestPasswordModal from "./request-certificate-trust";
import EndpointListTable from "./table";

export default function EndpointListComponent() {
  const { proxyList, setProxyList, addProxyItem } = proxyListStore();
  const [loaded, setLoaded] = useState(false);
  const [openSide, setOpenSide] = useState(false);
  const [passwordModalShown, setPasswordModalOpen] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<EndpointData>();

  const onDeleteFromHosts = useCallback(
    async (endpoint: EndpointData, password: string) => {
      invoke("delete_line_from_hosts", {
        hostname: endpoint.hostname,
        password: password,
      });
    },
    []
  );

  const openAppData = useCallback(async () => {
    const appDataDirPath = await appDataDir();
    shellOpen(appDataDirPath);
  }, []);

  const onDeleteEndpoint = useCallback(async (endpoint: EndpointData) => {
    setCurrentEndpoint(endpoint);
    const confirmed = await confirm(
      `Are you sure to delete ${endpoint.nickname}?`
    );
    if (!confirmed) {
      return;
    }

    invoke("remove_cert_from_keychain", {
      name: `${endpoint.hostname}`,
    });
    setPasswordModalOpen(true);
  }, []);

  const prepareConfigPage = useCallback(async () => {
    const mgr = EndpointManager.sharedManager();
    const list = await mgr.get();
    setProxyList(list);
    setLoaded(true);
  }, []);

  useEffect(() => {
    prepareConfigPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const shouldShowAddButton = loaded;

  return (
    <TooltipProvider delayDuration={0}>
      <div className="flex flex-col min-h-screen text-gray-100 bg-gray-900">
        <div className="">
          <CreateProxyV2SideComponent
            open={openSide}
            setOpen={setOpenSide}
            onAdd={(data) => {
              setCurrentEndpoint(data);
              addProxyItem(data);
            }}
          />
          <RequestPasswordModal
            description={"Ophiuchi wants to edit: /etc/hosts."}
            isOpen={passwordModalShown}
            onConfirm={function (password: string): void {
              setPasswordModalOpen(false);
              if (!currentEndpoint) return;
              onDeleteFromHosts(currentEndpoint, password);
              const endpointManager = EndpointManager.sharedManager();
              const configHelper = new CertificateManager();
              configHelper.deleteCertificateFiles(currentEndpoint.hostname);
              configHelper.deleteNginxConfigurationFiles(
                currentEndpoint.hostname
              );

              const copiedList = [...proxyList];
              const index = copiedList.findIndex((e: EndpointData) => {
                return e.hostname === currentEndpoint.hostname;
              });
              copiedList.splice(index, 1);

              endpointManager.save(copiedList);
              setProxyList(copiedList);
            }}
          />
          <div className="flex justify-between w-full fixed top-0 left-0 right-0 bg-gray-700 px-6 py-4 ">
            <div className="flex gap-2 items-center">
              <DockerControl />
              <Tooltip>
                <TooltipTrigger asChild>
                  <div
                    className="p-2 underline cursor-pointer text-sm"
                    onClick={() => {
                      openAppData();
                    }}
                  >
                    Open docker-compose folder
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Opens the folder where docker-compose.yml is located.</p>
                </TooltipContent>
              </Tooltip>
            </div>
            <div className="flex gap-2 items-center">
              <Tooltip>
                <TooltipTrigger asChild>
                  <a
                    className="p-2 underline cursor-pointer text-sm"
                    href={`https://heavenly-tent-fff.notion.site/Ophiuchi-Developers-Toolkit-734dc4f766fe40aebfe0da3cbbc304f5?pvs=4`}
                    target="_blank"
                  >
                    Help
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  <p>Open help docs.</p>
                </TooltipContent>
              </Tooltip>

              <Tooltip>
                <TooltipTrigger asChild>
                  <a href="https://discord.gg/fpp8kNyPtz" target="_blank">
                    <DiscordIcon className="w-4 h-4 text-white" />
                  </a>
                </TooltipTrigger>
                <TooltipContent side="bottom" sideOffset={12}>
                  <p>Get help from Discord.</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
        </div>

        <div className="p-4 mt-20">
          <EndpointListTable
            list={proxyList}
            onDeleteEndpoint={onDeleteEndpoint}
            onAddEndpoint={() => {
              setOpenSide(true);
            }}
          />
        </div>
      </div>
    </TooltipProvider>
  );
}
