import useSWR from "swr";
import { BiError, BiWifi, BiCheckCircle, BiXCircle } from "react-icons/bi";
import { MdSettingsEthernet } from "react-icons/md";
import { useTranslation } from "next-i18next";
import { SiUbiquiti } from "react-icons/si";

export default function Widget({ options }) {
  const { t, i18n } = useTranslation();

  const { data, error } = useSWR(
    `/api/widgets/unifi?${new URLSearchParams({ lang: i18n.language, ...options }).toString()}`
  );

  if (error || data?.error) {
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

  if (!data) {
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
