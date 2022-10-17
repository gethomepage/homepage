import { BiError, BiWifi, BiCheckCircle, BiXCircle } from "react-icons/bi";
import { MdSettingsEthernet } from "react-icons/md";
import { useTranslation } from "next-i18next";
import { SiUbiquiti } from "react-icons/si";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Widget({ options }) {
  const { t } = useTranslation();

  // eslint-disable-next-line no-param-reassign
  options.type = "unifi_console";
  const { data: statsData, error: statsError } = useWidgetAPI(options, "stat/sites", { index: options.index });

  if (statsError || statsData?.error) {
    return (
      <div className="flex flex-col justify-center first:ml-0 ml-4">
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-col items-center">
            <BiError className="w-8 h-8 text-theme-800 dark:text-theme-200" />
            <div className="flex flex-col ml-3 text-left">
              <span className="text-theme-800 dark:text-theme-200 text-sm">{t("widget.api_error")}</span>
              <span className="text-theme-800 dark:text-theme-200 text-xs">-</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const defaultSite = statsData?.data?.find(s => s.name === "default");

  if (!defaultSite) {
    return (
      <div className="flex flex-col justify-center first:ml-0 ml-4">
        <div className="flex flex-row items-center justify-end">
          <div className="flex flex-col items-center">
            <SiUbiquiti className="w-5 h-5 text-theme-800 dark:text-theme-200" />
          </div>
          <div className="flex flex-col ml-3 text-left">
            <span className="text-theme-800 dark:text-theme-200 text-xs">{t("unifi.wait")}</span>
          </div>
        </div>
      </div>
    );
  }

  const wan = defaultSite.health.find(h => h.subsystem === "wan");
  const lan = defaultSite.health.find(h => h.subsystem === "lan");
  const wlan = defaultSite.health.find(h => h.subsystem === "wlan");
  const data = {
    name: wan.gw_name,
    uptime: wan["gw_system-stats"].uptime,
    up: wan.status === 'ok',
    wlan: {
      users: wlan.num_user,
      status: wlan.status
    },
    lan: {
      users: lan.num_user,
      status: lan.status
    }
  };

  return (
    <div className="flex-none flex flex-row items-center mr-3 py-1.5">
      <div className="flex flex-col">
        <div className="flex flex-row ml-3">
          <SiUbiquiti className="text-theme-800 dark:text-theme-200 w-3 h-3 mr-1" />
          <div className="text-theme-800 dark:text-theme-200 text-xs font-bold flex flex-row justify-between">
            {data.name}
          </div>
        </div>
        <div className="flex flex-row ml-3 text-[10px] justify-between">
          <div className="flex flex-row" title={t("unifi.uptime")}>
            <div className="pr-0.5 text-theme-800 dark:text-theme-200">
              {t("common.number", {
                value: data.uptime / 86400,
                maximumFractionDigits: 1,
              })}
            </div>
            <div className="pr-1 text-theme-800 dark:text-theme-200">{t("unifi.days")}</div>
          </div>
          <div className="flex flex-row">
            <div className="pr-1 text-theme-800 dark:text-theme-200">{t("unifi.wan")}</div>
            { data.up
              ? <BiCheckCircle className="text-theme-800 dark:text-theme-200 h-4 w-3" />
              : <BiXCircle className="text-theme-800 dark:text-theme-200 h-4 w-3" />
            }
          </div>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex flex-row ml-3 py-0.5">
          <BiWifi className="text-theme-800 dark:text-theme-200 w-4 h-4 mr-1" />
          <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between" title={t("unifi.users")}>
            <div className="pr-0.5">
              {t("common.number", {
                value: data.wlan.users,
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>
        <div className="flex flex-row ml-3 pb-0.5">
          <MdSettingsEthernet className="text-theme-800 dark:text-theme-200 w-4 h-4 mr-1" />
          <div className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between" title={t("unifi.users")}>
            <div className="pr-0.5">
              {t("common.number", {
                value: data.lan.users,
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
