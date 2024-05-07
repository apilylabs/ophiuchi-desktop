/* eslint-disable react/no-unescaped-entities */
"use client";

import { CertificateManager } from "@/helpers/certificate-manager";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { invoke } from "@tauri-apps/api";
import { appDataDir } from "@tauri-apps/api/path";
import { Roboto_Mono } from "next/font/google";
import { Fragment, useCallback, useEffect, useRef, useState } from "react";
import RequestPasswordModal from "../request-certificate-trust";

const roboto = Roboto_Mono({ subsets: ["latin"] });
const certMgr = CertificateManager.shared();

export type EndpointData = {
  nickname: string;
  hostname: string;
  port: number;
};

function MultiStateButton({
  notReady,
  ready,
  done,
}: {
  notReady: {
    current: boolean;
    string: string;
  };
  ready: {
    current: boolean;
    string: string;
    onClick: () => void;
  };
  done: {
    current: boolean;
    string: string;
    onClick: () => void;
  };
}) {
  function bgColor() {
    if (done.current) return "bg-gray-500";
    if (ready.current) return "bg-yellow-500";
    if (notReady.current) return "bg-gray-300";
  }

  function hoverBgColor() {
    if (done.current) return "hover:bg-gray-600";
    if (ready.current) return "hover:bg-yellow-600";
    if (notReady.current) return "hover:bg-gray-400";
  }

  function textColor() {
    if (done.current) return "text-white";
    if (ready.current) return "text-gray-900";
    if (notReady.current) return "text-gray-800";
  }

  function displayString() {
    if (done.current) return done.string;
    if (ready.current) return ready.string;
    if (notReady.current) return notReady.string;
  }

  return (
    <button
      onClick={() => {
        if (notReady.current) return;
        if (ready.current) {
          ready.onClick();
        } else if (done.current) {
          done.onClick();
        }
      }}
      className={`block rounded-md ${bgColor()} px-6 py-2 text-center ${textColor()} ${hoverBgColor()} focus-visible:outline 
      focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500`}
    >
      <div className="flex gap-2 items-center">{displayString()}</div>
    </button>
  );
}

export default function CreateProxyV2SideComponent({
  open,
  setOpen,
  onAdd: onAddFinish,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAdd: (data: EndpointData) => void;
}) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [createStep, setCreateStep] = useState<number>(0);
  const [currentData, setCurrentData] = useState<EndpointData | null>(null);

  const [shouldGenerateSSLCert, setShouldGenerateSSLCert] = useState(false);
  const [sslCertGenComplete, setSSLCertGenComplete] = useState(false);

  const [shouldAddCertToKeychain, setShouldAddCertToKeychain] = useState(false);
  const [keychainAddComplete, setKeychainAddComplete] = useState(false);

  const [addToEtcHostsDone, setAddToEtcHostsDone] = useState(false);

  const [generateNginxConfDone, setGenerateNginxConfDone] = useState(false);

  const [passwordModalShown, setPasswordModalOpen] = useState(false);

  const onAddButton = useCallback(async (data: EndpointData) => {
    setCreateStep(1);
    setCurrentData(data);
    //
    // gen cert
    // const pems = await certMgr.generateCertificate(data.hostname);
    // const conf = await certMgr.generateNginxConfigurationFiles(
    //   data.hostname,
    //   data.port
    // );
    // setIsGenerating(false);
    // setOpen(false);
    // onAddFinish(data);
  }, []);

  const resetAndClose = useCallback(() => {
    setCreateStep(0);
    setCurrentData(null);
    setShouldGenerateSSLCert(false);
    setSSLCertGenComplete(false);
    setKeychainAddComplete(false);
    setAddToEtcHostsDone(false);
    setGenerateNginxConfDone(false);
    setOpen(false);
  }, [setOpen]);

  const onAddCertToKeychain = useCallback(async () => {
    if (!currentData) return;
    setShouldAddCertToKeychain(true);
    const appDataDirPath = await appDataDir();
    const pemFilePath = `${appDataDirPath}cert/${currentData.hostname}/cert.pem`;
    // support for whitespaces in path
    // const whiteSpaced = pemFilePath.replace(/ /g, "\\ ");
    invoke("remove_cert_from_keychain", {
      name: `${currentData.hostname}`,
    });

    invoke("add_cert_to_keychain", {
      pem_file_path: `${pemFilePath}`,
    });
    // setPasswordModalOpen(true);
    // setCurrentEndpoint(endpoint);
    setShouldAddCertToKeychain(false);
    setKeychainAddComplete(true);
  }, [currentData]);

  const onAddToHosts = useCallback(
    async (endpoint: EndpointData, password: string) => {
      invoke("add_line_to_hosts", {
        hostname: endpoint.hostname,
        password: password,
      });
      setAddToEtcHostsDone(true);
    },
    []
  );

  const onGenerateNginxConf = useCallback(async () => {
    if (!currentData) return;
    const conf = await certMgr.generateNginxConfigurationFiles(
      currentData.hostname,
      currentData.port
    );
    setGenerateNginxConfDone(true);
  }, [currentData]);

  useEffect(() => {
    if (shouldGenerateSSLCert && currentData) {
      certMgr.generateCertificate(currentData.hostname).then((pems) => {
        console.log(pems);
        setSSLCertGenComplete(true);
      });
    }
  }, [shouldGenerateSSLCert, currentData]);

  return (
    <>
      <RequestPasswordModal
        description={
          "Ophiuchi wants to edit: /etc/hosts. If you cancel, you can edit it manually."
        }
        isOpen={passwordModalShown}
        onConfirm={function (password: string): void {
          setPasswordModalOpen(false);
          if (!currentData) return;
          onAddToHosts(currentData, password);
        }}
      />
      <Transition.Root show={open} as={Fragment}>
        <Dialog
          as="div"
          className="relative z-10"
          onClose={() => {
            // do nothing
          }}
        >
          {/* {isGenerating && (
          <div className="fixed inset-0 z-10 bg-white bg-opacity-30 backdrop-blur-sm">
            <div className="w-full h-full flex flex-col gap-8 justify-center items-center">
              <div className="w-8 h-8 animate-ping rounded-full bg-green-500"></div>
              <div className="text-xs">
                Generating SSL certificate. It may take a while...
              </div>
            </div>
          </div>
        )} */}
          <div className="fixed inset-0 overflow-hidden bg-gray-950 bg-opacity-50 backdrop-blur-sm">
            <div className="absolute inset-0 overflow-hidden">
              <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
                <Transition.Child
                  as={Fragment}
                  enter="transform transition ease-in-out duration-300 sm:duration-500"
                  enterFrom="translate-x-full"
                  enterTo="translate-x-0"
                  leave="transform transition ease-in-out duration-300 sm:duration-500"
                  leaveFrom="translate-x-0"
                  leaveTo="translate-x-full"
                >
                  <Dialog.Panel className="pointer-events-auto w-screen max-w-full">
                    <div className="flex h-full flex-col overflow-y-scroll bg-gray-950 py-6 shadow-xl">
                      <div className="px-4 sm:px-6">
                        <div className="flex items-start justify-between">
                          <Dialog.Title className="text-lg font-semibold leading-6 text-white">
                            Let's create a new proxy!
                          </Dialog.Title>
                          <div className="ml-3 flex h-7 items-center">
                            <button
                              type="button"
                              className="relative rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                              onClick={() => resetAndClose()}
                            >
                              <span className="absolute -inset-2.5" />
                              <span className="sr-only">Close panel</span>
                              <XMarkIcon
                                className="h-6 w-6"
                                aria-hidden="true"
                              />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="relative mt-6 flex-1 px-4 sm:px-6">
                        {createStep === 0 && (
                          <CreateFormComponent
                            onNextButton={(data) => {
                              onAddButton(data);
                            }}
                          />
                        )}
                        {createStep >= 1 && (
                          <div className="flex flex-col gap-8 w-full max-w-3xl mx-auto h-full justify-center">
                            <div className="flex flex-col gap-8">
                              <div className="flex justify-between items-center">
                                <p>Generate SSL Certificate</p>
                                <div className="">
                                  <MultiStateButton
                                    notReady={{
                                      current: false,
                                      string: "Generate",
                                    }}
                                    ready={{
                                      current: !shouldGenerateSSLCert,
                                      string: "Generate",
                                      onClick: function (): void {
                                        setShouldGenerateSSLCert(true);
                                      },
                                    }}
                                    done={{
                                      current: sslCertGenComplete,
                                      string: "Locate",
                                      onClick: function (): void {
                                        // do nothing
                                      },
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <p>
                                  Register certificate to Keychain Access &
                                  trust certificate
                                </p>
                                <div className="">
                                  <MultiStateButton
                                    notReady={{
                                      current: !sslCertGenComplete,
                                      string: "Register",
                                    }}
                                    ready={{
                                      current: sslCertGenComplete,
                                      string: "Register & Trust",
                                      onClick: function (): void {
                                        onAddCertToKeychain();
                                      },
                                    }}
                                    done={{
                                      current: keychainAddComplete,
                                      string: "Done",
                                      onClick: function (): void {
                                        // do nothing
                                      },
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <p className="">
                                  Add this line:{" "}
                                  <code className="bg-gray-800 px-2 py-1 rounded-md">
                                    127.0.0.1 {currentData?.hostname}
                                  </code>{" "}
                                  to /etc/hosts file (requires sudo password)
                                </p>
                                <div className="">
                                  <MultiStateButton
                                    notReady={{
                                      current: !keychainAddComplete,
                                      string: "Add",
                                    }}
                                    ready={{
                                      current: keychainAddComplete,
                                      string: "Add",
                                      onClick: function (): void {
                                        setPasswordModalOpen(true);
                                      },
                                    }}
                                    done={{
                                      current: addToEtcHostsDone,
                                      string: "Done",
                                      onClick: function (): void {
                                        // do nothing
                                      },
                                    }}
                                  />
                                </div>
                              </div>
                              <div className="flex justify-between items-center">
                                <p>Generate Nginx Configuration</p>
                                <MultiStateButton
                                  notReady={{
                                    current: !addToEtcHostsDone,
                                    string: "Generate",
                                  }}
                                  ready={{
                                    current: addToEtcHostsDone,
                                    string: "Generate",
                                    onClick: function (): void {
                                      onGenerateNginxConf();
                                    },
                                  }}
                                  done={{
                                    current: generateNginxConfDone,
                                    string: "Done",
                                    onClick: function (): void {
                                      // do nothing
                                    },
                                  }}
                                />
                              </div>
                              <div className="flex justify-between items-center">
                                <p>Close Wizard</p>
                                <MultiStateButton
                                  notReady={{
                                    current: !generateNginxConfDone,
                                    string: "Waiting",
                                  }}
                                  ready={{
                                    current: generateNginxConfDone,
                                    string: "Close",
                                    onClick: function (): void {
                                      if (currentData) {
                                        onAddFinish(currentData);
                                      }
                                      resetAndClose();
                                    },
                                  }}
                                  done={{
                                    current: false,
                                    string: "Done",
                                    onClick: function (): void {
                                      resetAndClose();
                                    },
                                  }}
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
}

function CreateFormComponent({
  onNextButton,
}: {
  onNextButton: (data: EndpointData) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [hostnameState, setHostnameState] = useState<string>("");
  const [portState, setPortState] = useState<string>("");

  const fixHostname = (hostname: string) => {
    return hostname.replace(/[^a-z0-9\-\.]/g, "");
  };

  const onSubmitForm = useCallback(() => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    const nicknameGenerated = `Proxy for ${formData.get("hostname")}`;
    const data: EndpointData = {
      nickname: nicknameGenerated,
      hostname: formData.get("hostname") as string,
      port: parseInt(formData.get("port") as string),
    };
    onNextButton(data);
  }, [onNextButton]);

  return (
    <form
      className="flex flex-col gap-8 w-full h-full justify-center"
      ref={formRef}
      onSubmit={(e) => {
        e.preventDefault();
        onSubmitForm();
      }}
    >
      <div className="flex flex-col items-center justify-center gap-4">
        <p className="font-bold mt-8">I have:</p>
        <div className={"flex items-center gap-1" + " " + roboto.className}>
          <h1 className="text-5xl">http://localhost:</h1>
          <input
            type="number"
            name="port"
            min={1}
            max={65535}
            required={true}
            className="p-2 bg-transparent border border-gray-600 caret-gray-600 rounded-md text-gray-100 text-5xl"
            placeholder="3000"
            value={portState}
            onChange={(e) => {
              setPortState(e.target.value);
            }}
          />
        </div>

        <p className="font-bold mt-8">I want:</p>
        <div className={"flex items-center gap-1" + " " + roboto.className}>
          <h1 className="text-5xl">https://</h1>
          <input
            type="text"
            name="hostname"
            required={true}
            className="p-2 bg-transparent border border-gray-600 caret-gray-600 rounded-md text-gray-100 text-5xl"
            placeholder="my.example.local"
            size={24}
            value={hostnameState}
            onChange={(e) => setHostnameState(fixHostname(e.target.value))}
          />
        </div>
      </div>
      <div className="flex justify-center">
        <button
          type="submit"
          className="block rounded-md bg-white px-6 py-2 text-center font-semibold text-gray-800 hover:bg-gray-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 text-lg"
        >
          <div className="flex gap-2 items-center">
            Next <ArrowRightIcon className="h-4 w-4" />
          </div>
        </button>
      </div>
    </form>
  );
}
