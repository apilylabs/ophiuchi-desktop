"use client";

import { CertificateManager } from "@/helpers/certificate-manager";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Fragment, useCallback, useRef, useState } from "react";

export type EndpointData = {
  nickname: string;
  hostname: string;
  port: number;
};

export default function EndpointAddSideComponent({
  open,
  setOpen,
  onAdd,
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
    const data: EndpointData = {
      nickname: formData.get("nickname") as string,
      hostname: formData.get("hostname") as string,
      port: parseInt(formData.get("port") as string),
    };
    //
    onAdd(data);
    // gen cert
    const helper = new CertificateManager();
    const pems = await helper.generateCertificate(data.hostname);
    const conf = await helper.generateNginxConfigurationFiles(
      data.hostname,
      data.port
    );

    setIsGenerating(false);
    setOpen(false);
  }, [onAdd, setOpen]);

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
                Generating SSL certificate may take a while...
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
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-gray-950 py-6 shadow-xl">
                    <div className="px-4 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-base font-semibold leading-6 text-white">
                          Add Endpoint
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
                        className="flex flex-col gap-8 w-full max-w-sm"
                        ref={formRef}
                        onSubmit={(e) => {
                          e.preventDefault();
                          onAddButton();
                        }}
                      >
                        <div className="flex flex-col gap-1">
                          <label className="text-sm">Name</label>
                          <input
                            type="text"
                            name="nickname"
                            required={true}
                            className="p-2 bg-transparent border-b border-b-gray-600 caret-gray-600"
                            placeholder="my-server"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm">Hostname</label>
                          <input
                            type="text"
                            name="hostname"
                            required={true}
                            className="p-2 bg-transparent border-b border-b-gray-600 caret-gray-600"
                            placeholder="local.domain.com"
                          />
                        </div>
                        <div className="flex flex-col gap-1">
                          <label className="text-sm">Port</label>
                          <input
                            type="number"
                            name="port"
                            min={1}
                            max={65535}
                            className="p-2 bg-transparent border-b border-b-gray-600 caret-gray-600"
                            placeholder="3000"
                          />
                        </div>
                        <div className="">
                          <button
                            type="button"
                            className="block rounded-md bg-indigo-500 px-3 py-2 text-center text-sm font-semibold text-white hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
                          >
                            Add
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
