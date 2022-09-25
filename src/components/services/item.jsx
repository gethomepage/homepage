import Image from "next/future/image";
import classNames from "classnames";
import { useContext, useState } from "react";

import Status from "./status";
import Widget from "./widget";
import Docker from "./widgets/service/docker";

import { SettingsContext } from "utils/settings-context";

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
  const hasLink = service.href && service.href !== "#";
  const { settings } = useContext(SettingsContext);
  const [statsOpen, setStatsOpen] = useState(false);

  return (
    <li key={service.name}>
      <div
        className={`${
          hasLink ? "cursor-pointer " : " "
        }transition-all h-15 mb-3 p-1 rounded-md font-medium text-theme-700 hover:text-theme-700/70 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-black/10 dark:shadow-black/20 bg-white/50 hover:bg-theme-300/20 dark:bg-white/10 dark:hover:bg-white/20`}
      >
        <div className="flex select-none">
          {service.icon &&
            (hasLink ? (
              <a
                href={service.href}
                target={settings.target ?? "_blank"}
                rel="noreferrer"
                className="flex-shrink-0 flex items-center justify-center w-12 "
              >
                <Image src={resolveIcon(service.icon)} width={32} height={32} alt="logo" />
              </a>
            ) : (
              <div className="flex-shrink-0 flex items-center justify-center w-12 ">
                <Image src={resolveIcon(service.icon)} width={32} height={32} alt="logo" />
              </div>
            ))}

          {hasLink ? (
            <a
              href={service.href}
              target={settings.target ?? "_blank"}
              rel="noreferrer"
              className="flex-1 flex items-center justify-between rounded-r-md "
            >
              <div className="flex-1 px-2 py-2 text-sm text-left">
                {service.name}
                <p className="text-theme-500 dark:text-theme-400 text-xs font-light">{service.description}</p>
              </div>
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-between rounded-r-md ">
              <div className="flex-1 px-2 py-2 text-sm text-left">
                {service.name}
                <p className="text-theme-500 dark:text-theme-400 text-xs font-light">{service.description}</p>
              </div>
            </div>
          )}

          {service.container && (
            <button
              type="button"
              onClick={() => setStatsOpen(!statsOpen)}
              className="flex-shrink-0 flex items-center justify-center w-12 cursor-pointer"
            >
              <Status service={service} />
            </button>
          )}
        </div>

        <div
          className={classNames(
            statsOpen ? "max-h-[55px] opacity-100" : " max-h-[0] opacity-0",
            "w-full overflow-hidden transition-all duration-300 ease-in-out"
          )}
        >
          <Docker service={{ widget: { container: service.container, server: service.server } }} />
        </div>

        {service.widget && <Widget service={service} />}
      </div>
    </li>
  );
}
