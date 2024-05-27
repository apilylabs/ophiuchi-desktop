import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { CertificateManager } from "@/helpers/certificate-manager";
import { ProxyManager } from "@/helpers/proxy-manager";
import { IProxyData } from "@/helpers/proxy-manager/interfaces";
import { cn } from "@/lib/utils";
import proxyListStore from "@/stores/proxy-list";
import { PlusIcon } from "@heroicons/react/24/outline";
import { invoke } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";
import { open as shellOpen } from "@tauri-apps/api/shell";
import { useCallback, useEffect, useState } from "react";
import CreateProxyV2SideComponent from "../add-new";
import RequestPasswordModal from "../request-certificate-trust";

const people = [
  {
    name: "Lindsay Walton",
    title: "Front-end Developer",
    email: "lindsay.walton@example.com",
    role: "Member",
  },
  // More people...
];

export default function ProxyListTable({ list }: { list: any[] }) {
  const {
    proxyList,
    selectedGroup,
    setProxyList,
    addProxyItem,
    setProxyGroupList,
  } = proxyListStore();

  const [loaded, setLoaded] = useState(false);
  const [openSide, setOpenSide] = useState(false);
  const [currentEndpoint, setCurrentEndpoint] = useState<IProxyData>();
  const [passwordModalShown, setPasswordModalOpen] = useState(false);

  const onDeleteFromHosts = useCallback(
    async (endpoint: IProxyData, password: string) => {
      invoke("delete_line_from_hosts", {
        hostname: endpoint.hostname,
        password: password,
      });
    },
    []
  );

  const onDeleteEndpoint = useCallback(async (endpoint: IProxyData) => {
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

  const openCert = useCallback(async (data: IProxyData) => {
    const appDataDirPath = await appDataDir();
    const certPath = `${appDataDirPath}/cert/${data.hostname}`;
    shellOpen(certPath);
  }, []);

  const prepareConfigPage = useCallback(async () => {
    const mgr = ProxyManager.sharedManager();
    const list = await mgr.getProxies();
    const gList = await mgr.getGroups();
    setProxyList(list);
    setProxyGroupList(gList);
    setLoaded(true);
  }, [setProxyGroupList, setProxyList]);

  useEffect(() => {
    prepareConfigPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
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
          const endpointManager = ProxyManager.sharedManager();
          const configHelper = new CertificateManager();
          configHelper.deleteCertificateFiles(currentEndpoint.hostname);
          configHelper.deleteNginxConfigurationFiles(currentEndpoint.hostname);

          const copiedList = [...proxyList];
          const index = copiedList.findIndex((e: IProxyData) => {
            return e.hostname === currentEndpoint.hostname;
          });
          copiedList.splice(index, 1);

          endpointManager.saveProxies(copiedList);
          setProxyList(copiedList);
        }}
      />
      <div className="px-4">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h1 className="text-base font-semibold leading-6 text-white">
              Your Proxies
            </h1>
            <p className="mt-2 text-sm text-gray-300">
              List of proxies that are currently registered.
            </p>
          </div>
          <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button
              variant={"default"}
              className={cn(
                "flex gap-2 items-center",
                list.length === 0 ? "animate-bounce" : ""
              )}
              onClick={() => {
                setOpenSide(true);
              }}
            >
              <PlusIcon className="w-4 h-4" />
              Create Proxy
            </Button>
          </div>
        </div>
        <div className="mt-8 flow-root">
          <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <table className="min-w-full divide-y divide-gray-700">
                <thead>
                  <tr>
                    {/* <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0"
                  >
                    Nickname
                  </th> */}
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white sm:pl-0"
                    >
                      Hostname
                    </th>
                    <th
                      scope="col"
                      className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                    >
                      Application Port
                    </th>
                    {/* <th
                    scope="col"
                    className="px-3 py-3.5 text-left text-sm font-semibold text-white"
                  >
                    Actions
                  </th> */}
                    {/* <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0">
                    <span className="sr-only">Delete</span>
                  </th> */}
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-800">
                  {list.map((endpoint) => (
                    <tr key={endpoint.nickname}>
                      {/* <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                      {endpoint.nickname}
                    </td> */}
                      <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <a
                              className="p-2 underline cursor-pointer text-sm sm:pl-0"
                              href={`https://${endpoint.hostname}`}
                              target="_blank"
                            >
                              {endpoint.hostname}
                            </a>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>Click to open on browser.</p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                      <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                        {endpoint.port}
                      </td>
                      {/* <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">
                      <p
                        className="underline cursor-pointer"
                        onClick={() => {
                          onAddCertToKeychain(endpoint);
                        }}
                      >
                        Trust SSL Cert
                      </p>
                    </td> */}
                      <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                        <div className="flex gap-6 justify-end">
                          <p
                            onClick={() => {
                              openCert(endpoint);
                            }}
                            className="text-indigo-400 hover:text-indigo-300 cursor-pointer"
                          >
                            Locate Cert
                            <span className="sr-only">, {endpoint.name}</span>
                          </p>
                          <p
                            onClick={() => {
                              onDeleteEndpoint(endpoint);
                            }}
                            className="text-red-400 hover:text-red-300 cursor-pointer"
                          >
                            Delete
                            <span className="sr-only">, {endpoint.name}</span>
                          </p>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
