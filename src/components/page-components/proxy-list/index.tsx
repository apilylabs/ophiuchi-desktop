"use client";

import { CertificateManager } from "@/helpers/certificate-manager";
import { EndpointManager } from "@/helpers/endpoint-manager";
import { invoke } from "@tauri-apps/api";
import { confirm } from "@tauri-apps/api/dialog";
import { appDataDir } from "@tauri-apps/api/path";
import { open as shellOpen } from "@tauri-apps/api/shell";
import { useCallback, useEffect, useState } from "react";
import DockerControl from "../docker-control";
import { EndpointData } from "./add";
import CreateProxyV2SideComponent from "./add-new";
import RequestPasswordModal from "./request-certificate-trust";
import EndpointListTable from "./table";

export default function EndpointListComponent() {
  const [loaded, setLoaded] = useState(false);
  const [endpointList, setEndpointList] = useState([]);
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
      <div className="">
        <CreateProxyV2SideComponent
          open={openSide}
          setOpen={setOpenSide}
          onAdd={(data) => {
            setCurrentEndpoint(data);
            addEndpoint(data);
          }}
        />
        <RequestPasswordModal
          description={
            "Ophiuchi wants to edit: /etc/hosts. If you cancel, you can edit it manually."
          }
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

            const copiedList = [...endpointList];
            const index = copiedList.findIndex((e: EndpointData) => {
              return e.hostname === currentEndpoint.hostname;
            });
            copiedList.splice(index, 1);

            endpointManager.save(copiedList);
            setEndpointList(copiedList);
          }}
        />
        <div className="flex gap-2 px-4 py-4 fixed top-0 left-0 right-0 bg-gray-700">
          <DockerControl endpointList={endpointList} />
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

      <div className="p-4 mt-20">
        <EndpointListTable
          list={endpointList}
          onDeleteEndpoint={onDeleteEndpoint}
          onAddEndpoint={() => {
            setOpenSide(true);
          }}
        />
      </div>
    </div>
  );
}
