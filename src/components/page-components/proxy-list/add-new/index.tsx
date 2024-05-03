/* eslint-disable react/no-unescaped-entities */
"use client";

import { CertificateManager } from "@/helpers/certificate-manager";
import { Dialog, Transition } from "@headlessui/react";
import { ArrowRightIcon, XMarkIcon } from "@heroicons/react/24/outline";
import { Roboto_Mono } from "next/font/google";
import { Fragment, useCallback, useRef, useState } from "react";

const roboto = Roboto_Mono({ subsets: ["latin"] });
const certMgr = CertificateManager.shared();

export type EndpointData = {
  nickname: string;
  hostname: string;
  port: number;
};

export default function CreateProxyV2SideComponent({
  open,
  setOpen,
  onAdd: onAddFinish,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  onAdd: (data: EndpointData) => void;
}) {
  const formRef = useRef<HTMLFormElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const onAddButton = useCallback(async () => {
    if (!formRef.current) return;
    const formData = new FormData(formRef.current);
    setIsGenerating(true);
    const nicknameGenerated = `Proxy for ${formData.get("hostname")}`;
    const data: EndpointData = {
      nickname: nicknameGenerated,
      hostname: formData.get("hostname") as string,
      port: parseInt(formData.get("port") as string),
    };
    //
    // gen cert

    const pems = await certMgr.generateCertificate(data.hostname);
    const conf = await certMgr.generateNginxConfigurationFiles(
      data.hostname,
      data.port
    );

    setIsGenerating(false);
    setOpen(false);
    onAddFinish(data);
  }, [onAddFinish, setOpen]);

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={() => {
          // do nothing
        }}
      >
        {isGenerating && (
          <div className="fixed inset-0 z-10 bg-white bg-opacity-30 backdrop-blur-sm">
            <div className="w-full h-full flex flex-col gap-8 justify-center items-center">
              <div className="w-8 h-8 animate-ping rounded-full bg-green-500"></div>
              <div className="text-xs">
                Generating SSL certificate. It may take a while...
              </div>
            </div>
          </div>
        )}
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
                            onClick={() => setOpen(false)}
                          >
                            <span className="absolute -inset-2.5" />
                            <span className="sr-only">Close panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="relative mt-6 flex-1 px-4 sm:px-6">
                      <form
                        className="flex flex-col gap-8 w-full h-full justify-center"
                        ref={formRef}
                        onSubmit={(e) => {
                          e.preventDefault();
                          onAddButton();
                        }}
                      >
                        <div className="flex flex-col items-center justify-center gap-4">
                          <p className="font-bold mt-8">I have:</p>
                          <div
                            className={
                              "flex items-center gap-1" + " " + roboto.className
                            }
                          >
                            <h1 className="text-5xl">http://localhost:</h1>
                            <input
                              type="number"
                              name="port"
                              min={1}
                              max={65535}
                              required={true}
                              className="p-2 bg-transparent border border-gray-600 caret-gray-600 rounded-md text-gray-100 text-5xl"
                              placeholder="3000"
                            />
                          </div>

                          <p className="font-bold mt-8">I want:</p>
                          <div
                            className={
                              "flex items-center gap-1" + " " + roboto.className
                            }
                          >
                            <h1 className="text-5xl">https://</h1>
                            <input
                              type="text"
                              name="hostname"
                              required={true}
                              className="p-2 bg-transparent border border-gray-600 caret-gray-600 rounded-md text-gray-100 text-5xl"
                              placeholder="my.example.local"
                              size={24}
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
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
