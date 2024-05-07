import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { PlusIcon } from "@heroicons/react/24/outline";
import { appDataDir } from "@tauri-apps/api/path";
import { open as shellOpen } from "@tauri-apps/api/shell";
import { useCallback } from "react";
import { EndpointData } from "../add-new";

const people = [
  {
    name: "Lindsay Walton",
    title: "Front-end Developer",
    email: "lindsay.walton@example.com",
    role: "Member",
  },
  // More people...
];

export default function EndpointListTable({
  list,
  onDeleteEndpoint,
  onAddEndpoint,
}: {
  list: any[];
  onDeleteEndpoint: (endpoint: any) => void;
  onAddEndpoint: () => void;
}) {
  const openCert = useCallback(async (data: EndpointData) => {
    const appDataDirPath = await appDataDir();
    const certPath = `${appDataDirPath}/cert/${data.hostname}`;
    shellOpen(certPath);
  }, []);

  return (
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
              onAddEndpoint();
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
                      {endpoint.hostname}
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
  );
}
