import classNames from "classnames";
import { useContext, useState } from "react";

import Status from "./status";
import Widget from "./widget";

import Docker from "widgets/docker/component";
import { SettingsContext } from "utils/contexts/settings";
import resolveIcon from "utils/icon-resolver";

export default function Item({ service }) {
  const hasLink = service.href && service.href !== "#";
  const { settings } = useContext(SettingsContext);
  const [statsOpen, setStatsOpen] = useState(false);
  const [statsClosing, setStatsClosing] = useState(false);

  // set stats to closed after 300ms
  const closeStats = () => {
    if (statsOpen) {
      setStatsClosing(true);
      setTimeout(() => {
        setStatsOpen(false);
        setStatsClosing(false);
      }, 300);
    }
  };

  return (
    <li key={service.name}>
      <div
        className={`${
          hasLink ? "cursor-pointer " : " "
        }transition-all h-15 mb-3 p-1 rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10`}
      >
        <div className="flex select-none">
          {service.icon &&
            (hasLink ? (
              <a
                href={service.href}
                target={service.target ?? settings.target ?? "_blank"}
                rel="noreferrer"
                className="flex-shrink-0 flex items-center justify-center w-12 "
              >
                {resolveIcon(service.icon)}
              </a>
            ) : (
              <div className="flex-shrink-0 flex items-center justify-center w-12 ">{resolveIcon(service.icon)}</div>
            ))}

          {hasLink ? (
            <a
              href={service.href}
              target={service.target ?? settings.target ?? "_blank"}
              rel="noreferrer"
              className="flex-1 flex items-center justify-between rounded-r-md "
            >
              <div className="flex-1 px-2 py-2 text-sm text-left">
                {service.name}
                <p className="text-theme-500 dark:text-theme-300 text-xs font-light">{service.description}</p>
              </div>
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-between rounded-r-md ">
              <div className="flex-1 px-2 py-2 text-sm text-left">
                {service.name}
                <p className="text-theme-500 dark:text-theme-300 text-xs font-light">{service.description}</p>
              </div>
            </div>
          )}

          {service.container && (
            <button
              type="button"
              onClick={() => (statsOpen ? closeStats() : setStatsOpen(true))}
              className="flex-shrink-0 flex items-center justify-center w-12 cursor-pointer"
            >
              <Status service={service} />
              <span className="sr-only">View container stats</span>
            </button>
          )}
        </div>

        {service.container && service.server && (
          <div
            className={classNames(
              statsOpen && !statsClosing ? "max-h-[55px] opacity-100" : " max-h-[0] opacity-0",
              "w-full overflow-hidden transition-all duration-300 ease-in-out"
            )}
          >
            {statsOpen && <Docker service={{ widget: { container: service.container, server: service.server } }} />}
          </div>
        )}

        {service.widget && <Widget service={service} />}
      </div>
    </li>
  );
}
