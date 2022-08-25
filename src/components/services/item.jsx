import Image from "next/future/image";
import { useState } from "react";
import { Disclosure, Transition } from "@headlessui/react";

import Status from "./status";
import Widget from "./widget";
import Docker from "./widgets/service/docker";

export default function Item({ service }) {
  return (
    <li key={service.name} className="">
      <Disclosure>
        <div className="transition-all h-15 overflow-hidden mb-3 cursor-pointer p-1 rounded-md font-medium text-theme-700 hover:text-theme-800 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900 bg-white/50 hover:bg-theme-300/10 dark:bg-white/5 dark:hover:bg-white/10">
          <div className="flex">
            <div
              onClick={() => {
                window.open(service.href, "_blank").focus();
              }}
              className="flex-shrink-0 flex items-center justify-center w-12 "
            >
              <Image
                src={`https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${service.icon}`}
                width={32}
                height={32}
                alt="logo"
              />
            </div>
            <div
              onClick={() => {
                window.open(service.href, "_blank").focus();
              }}
              className="flex-1 flex items-center justify-between rounded-r-md "
            >
              <div className="flex-1 px-2 py-2 text-sm">
                {service.name}
                <p className="text-theme-500 dark:text-theme-400 text-xs font-extralight">{service.description}</p>
              </div>
            </div>
            {service.container && (
              <Disclosure.Button as="div" className="flex-shrink-0 flex items-center justify-center w-12 ">
                <Status service={service} />
              </Disclosure.Button>
            )}
          </div>

          <Disclosure.Panel>
            <div className="w-full">
              <Docker service={{ widget: { container: service.container, server: service.server } }} />
            </div>
          </Disclosure.Panel>

          {service.widget && <Widget service={service} />}
        </div>
      </Disclosure>
    </li>
  );
}
