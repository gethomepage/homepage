import Image from "next/future/image";
import { Disclosure } from "@headlessui/react";
import { useState } from "react";
import { useTranslation } from "react-i18next";

import Status from "./status";
import Widget from "./widget";
import Docker from "./widgets/service/docker";
import Dropdown from "./dropdown";

function resolveIcon(icon) {
  if (icon.startsWith("http")) {
    return `/api/proxy?url=${encodeURIComponent(icon)}`;
  }

  if (icon.startsWith("/")) {
    return icon;
  }

  if (icon.endsWith(".png")) {
    return `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${icon}`;
  }

  return `https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/png/${icon}.png`;
}

export default function Item({ service }) {
  const { t } = useTranslation();

  const handleOnClick = () => {
    if (service.href && service.href !== "#") {
      window.open(service.href, "_blank").focus();
    }
  };

  const cmcValues = [
    { label: t("coinmarketcap.1hour"), value: "1h" },
    { label: t("coinmarketcap.1day"), value: "24h" },
    { label: t("coinmarketcap.7days"), value: "7d" },
    { label: t("coinmarketcap.30days"), value: "30d" },
  ];

  const [cmcV, cmcSet] = useState(cmcValues[0]);

  const states = {
    coinmarketcap: { value: cmcV, set: cmcSet },
  };

  const hasLink = service.href && service.href !== "#";

  return (
    <li key={service.name}>
      <Disclosure>
        <div
          className={`${
            hasLink ? "cursor-pointer " : " "
          }transition-all h-15 mb-3 p-1 rounded-md font-medium text-theme-700 hover:text-theme-700/70 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-black/10 dark:shadow-black/20 bg-white/50 hover:bg-theme-300/20 dark:bg-white/10 dark:hover:bg-white/20`}
        >
          <div className="flex select-none">
            {service.icon &&
              (hasLink ? (
                <button
                  type="button"
                  onClick={handleOnClick}
                  className="flex-shrink-0 flex items-center justify-center w-12 "
                >
                  <Image src={resolveIcon(service.icon)} width={32} height={32} alt="logo" />
                </button>
              ) : (
                <div className="flex-shrink-0 flex items-center justify-center w-12 ">
                  <Image src={resolveIcon(service.icon)} width={32} height={32} alt="logo" />
                </div>
              ))}

            {hasLink ? (
              <button
                type="button"
                onClick={handleOnClick}
                className="flex-1 flex items-center justify-between rounded-r-md "
              >
                <div className="flex-1 px-2 py-2 text-sm text-left">
                  {service.name}
                  <p className="text-theme-500 dark:text-theme-400 text-xs font-extralight">{service.description}</p>
                </div>
              </button>
            ) : (
              <div className="flex-1 flex items-center justify-between rounded-r-md ">
                <div className="flex-1 px-2 py-2 text-sm text-left">
                  {service.name}
                  <p className="text-theme-500 dark:text-theme-400 text-xs font-extralight">{service.description}</p>
                </div>
              </div>
            )}

            {service.container && (
              <Disclosure.Button
                as="div"
                className="flex-shrink-0 flex items-center justify-center w-12 cursor-pointer"
              >
                <Status service={service} />
              </Disclosure.Button>
            )}
            {service?.widget?.type === "coinmarketcap" && <Dropdown state={states.coinmarketcap} options={cmcValues} />}
          </div>

          <Disclosure.Panel>
            <div className="w-full">
              <Docker service={{ widget: { container: service.container, server: service.server } }} />
            </div>
          </Disclosure.Panel>

          {service.widget && <Widget state={states[service?.widget?.type]} service={service} />}
        </div>
      </Disclosure>
    </li>
  );
}
