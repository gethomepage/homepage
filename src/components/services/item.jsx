import classNames from "classnames";
import { useContext, useState } from "react";

import Status from "./status";
import Widget from "./widget";
import Ping from "./ping";
import SiteMonitor from "./site-monitor";
import KubernetesStatus from "./kubernetes-status";

import Docker from "widgets/docker/component";
import Kubernetes from "widgets/kubernetes/component";
import { SettingsContext } from "utils/contexts/settings";
import ResolvedIcon from "components/resolvedicon";

export default function Item({ service, groupName, useEqualHeights }) {
  const hasLink = service.href && service.href !== "#";
  const { settings } = useContext(SettingsContext);
  const showStats = service.showStats === false ? false : settings.showStats;
  const statusStyle = service.statusStyle !== undefined ? service.statusStyle : settings.statusStyle;
  const [statsOpen, setStatsOpen] = useState(service.showStats);
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
    <li key={service.name} id={service.id} className="service" data-name={service.name || ""}>
      <div
        className={classNames(
          settings.cardBlur !== undefined && `backdrop-blur${settings.cardBlur.length ? "-" : ""}${settings.cardBlur}`,
          useEqualHeights && "h-[calc(100%-0.5rem)]",
          "transition-all mb-2 p-1 rounded-md font-medium text-theme-700 dark:text-theme-200 dark:hover:text-theme-300 shadow-md shadow-theme-900/10 dark:shadow-theme-900/20 bg-theme-100/20 hover:bg-theme-300/20 dark:bg-white/5 dark:hover:bg-white/10 relative overflow-clip service-card",
        )}
      >
        <div className="flex select-none z-0 service-title">
          {service.icon &&
            (hasLink ? (
              <a
                href={service.href}
                target={service.target ?? settings.target ?? "_blank"}
                rel="noreferrer"
                className="flex-shrink-0 flex items-center justify-center w-12 service-icon z-10"
                aria-label={service.icon}
              >
                <ResolvedIcon icon={service.icon} />
              </a>
            ) : (
              <div className="flex-shrink-0 flex items-center justify-center w-12 service-icon z-10">
                <ResolvedIcon icon={service.icon} />
              </div>
            ))}

          {hasLink ? (
            <a
              href={service.href}
              target={service.target ?? settings.target ?? "_blank"}
              rel="noreferrer"
              className="flex-1 flex items-center justify-between rounded-r-md service-title-text"
            >
              <div className="flex-1 px-2 py-2 text-sm text-left z-10 service-name">
                {service.name}
                <p className="text-theme-500 dark:text-theme-300 text-xs font-light service-description">
                  {service.description}
                </p>
              </div>
            </a>
          ) : (
            <div className="flex-1 flex items-center justify-between rounded-r-md service-title-text">
              <div className="flex-1 px-2 py-2 text-sm text-left z-10 service-name">
                {service.name}
                <p className="text-theme-500 dark:text-theme-300 text-xs font-light service-description">
                  {service.description}
                </p>
              </div>
            </div>
          )}

          <div
            className={`absolute top-0 right-0 flex flex-row justify-end ${
              statusStyle === "dot" ? "gap-0" : "gap-2 mr-2"
            } z-10 service-tags`}
          >
            {service.ping && (
              <div className="flex-shrink-0 flex items-center justify-center service-tag service-ping">
                <Ping groupName={groupName} serviceName={service.name} style={statusStyle} />
                <span className="sr-only">Ping status</span>
              </div>
            )}

            {service.siteMonitor && (
              <div className="flex-shrink-0 flex items-center justify-center service-tag service-site-monitor">
                <SiteMonitor groupName={groupName} serviceName={service.name} style={statusStyle} />
                <span className="sr-only">Site monitor status</span>
              </div>
            )}

            {service.container && (
              <button
                type="button"
                onClick={() => (statsOpen ? closeStats() : setStatsOpen(true))}
                className="flex-shrink-0 flex items-center justify-center cursor-pointer service-tag service-container-stats"
              >
                <Status service={service} style={statusStyle} />
                <span className="sr-only">View container stats</span>
              </button>
            )}
            {service.app && !service.external && (
              <button
                type="button"
                onClick={() => (statsOpen ? closeStats() : setStatsOpen(true))}
                className="flex-shrink-0 flex items-center justify-center cursor-pointer service-tag service-app"
              >
                <KubernetesStatus service={service} style={statusStyle} />
                <span className="sr-only">View container stats</span>
              </button>
            )}
          </div>
        </div>

        {service.container && service.server && (
          <div
            className={classNames(
              showStats || (statsOpen && !statsClosing) ? "max-h-[110px] opacity-100" : " max-h-[0] opacity-0",
              "w-full overflow-hidden transition-all duration-300 ease-in-out service-stats",
            )}
          >
            {(showStats || statsOpen) && (
              <Docker service={{ widget: { container: service.container, server: service.server } }} />
            )}
          </div>
        )}
        {service.app && (
          <div
            className={classNames(
              showStats || (statsOpen && !statsClosing) ? "max-h-[55px] opacity-100" : " max-h-[0] opacity-0",
              "w-full overflow-hidden transition-all duration-300 ease-in-out service-stats",
            )}
          >
            {(showStats || statsOpen) && (
              <Kubernetes
                service={{
                  widget: { namespace: service.namespace, app: service.app, podSelector: service.podSelector },
                }}
              />
            )}
          </div>
        )}

        {service.widgets.map((widget) => (
          <Widget widget={widget} service={service} key={widget.index} />
        ))}
      </div>
    </li>
  );
}
