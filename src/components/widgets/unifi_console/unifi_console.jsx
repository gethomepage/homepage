import { BiError, BiWifi, BiCheckCircle, BiXCircle, BiNetworkChart } from "react-icons/bi";
import { MdSettingsEthernet } from "react-icons/md";
import { useTranslation } from "next-i18next";
import { SiUbiquiti } from "react-icons/si";

import Error from "../widget/error";
import Container from "../widget/container";
import Raw from "../widget/raw";
import WidgetIcon from "../widget/widget_icon";
import PrimaryText from "../widget/primary_text";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Widget({ options }) {
  const { t } = useTranslation();

  // eslint-disable-next-line no-param-reassign, no-multi-assign
  options.service_group = options.service_name = "unifi_console";
  const { data: statsData, error: statsError } = useWidgetAPI(options, "stat/sites", { index: options.index });

  if (statsError) {
    return <Error options={options} />;
  }

  const defaultSite = options.site
    ? statsData?.data.find((s) => s.desc === options.site)
    : statsData?.data?.find((s) => s.name === "default");

  if (!defaultSite) {
    return (
      <Container options={options} additionalClassNames="information-widget-unifi-console">
        <PrimaryText>{t("unifi.wait")}</PrimaryText>
        <WidgetIcon icon={SiUbiquiti} />
      </Container>
    );
  }

  const wan = defaultSite.health.find((h) => h.subsystem === "wan");
  const lan = defaultSite.health.find((h) => h.subsystem === "lan");
  const wlan = defaultSite.health.find((h) => h.subsystem === "wlan");
  [wan, lan, wlan].forEach((s) => {
    s.up = s.status === "ok"; // eslint-disable-line no-param-reassign
    s.show = s.status !== "unknown"; // eslint-disable-line no-param-reassign
  });
  const name = wan.gw_name ?? defaultSite.desc;
  const uptime = wan["gw_system-stats"] ? wan["gw_system-stats"].uptime : null;

  const dataEmpty = !(wan.show || lan.show || wlan.show || uptime);

  return (
    <Container options={options} additionalClassNames="information-widget-unifi-console">
      <Raw>
        <div className="flex-none flex flex-row items-center mr-3 py-1.5">
          <div className="flex flex-col">
            <div className="flex flex-row ml-3 mb-0.5">
              <SiUbiquiti className="text-theme-800 dark:text-theme-200 w-3 h-3 mr-1" />
              <div className="text-theme-800 dark:text-theme-200 text-xs font-bold flex flex-row justify-between">
                {name}
              </div>
            </div>
            {dataEmpty && (
              <div className="flex flex-row ml-3 text-[8px] justify-between">
                <div className="flex flex-row items-center justify-end">
                  <div className="flex flex-row">
                    <BiError className="w-4 h-4 text-theme-800 dark:text-theme-200" />
                    <span className="text-theme-800 dark:text-theme-200 text-xs">{t("unifi.empty_data")}</span>
                  </div>
                </div>
              </div>
            )}
            <div className="flex flex-row ml-3 text-[10px] justify-between">
              {uptime && (
                <div className="flex flex-row" title={t("unifi.uptime")}>
                  <div className="pr-0.5 text-theme-800 dark:text-theme-200">
                    {t("common.number", {
                      value: uptime / 86400,
                      maximumFractionDigits: 1,
                    })}
                  </div>
                  <div className="pr-1 text-theme-800 dark:text-theme-200">{t("unifi.days")}</div>
                </div>
              )}
              {wan.show && (
                <div className="flex flex-row">
                  <div className="pr-1 text-theme-800 dark:text-theme-200">{t("unifi.wan")}</div>
                  {wan.up ? (
                    <BiCheckCircle className="text-theme-800 dark:text-theme-200 h-4 w-3" />
                  ) : (
                    <BiXCircle className="text-theme-800 dark:text-theme-200 h-4 w-3" />
                  )}
                </div>
              )}
              {!wan.show && !lan.show && wlan.show && (
                <div className="flex flex-row">
                  <div className="pr-1 text-theme-800 dark:text-theme-200">{t("unifi.wlan")}</div>
                  {wlan.up ? (
                    <BiCheckCircle className="text-theme-800 dark:text-theme-200 h-4 w-3" />
                  ) : (
                    <BiXCircle className="text-theme-800 dark:text-theme-200 h-4 w-3" />
                  )}
                </div>
              )}
              {!wan.show && !wlan.show && lan.show && (
                <div className="flex flex-row">
                  <div className="pr-1 text-theme-800 dark:text-theme-200">{t("unifi.lan")}</div>
                  {lan.up ? (
                    <BiCheckCircle className="text-theme-800 dark:text-theme-200 h-4 w-3" />
                  ) : (
                    <BiXCircle className="text-theme-800 dark:text-theme-200 h-4 w-3" />
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col">
            {wlan.show && (
              <div className="flex flex-row ml-3 py-0.5">
                <BiWifi className="text-theme-800 dark:text-theme-200 w-4 h-4 mr-1" />
                <div
                  className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between"
                  title={t("unifi.users")}
                >
                  <div className="pr-0.5">
                    {t("common.number", {
                      value: wlan.num_user,
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              </div>
            )}
            {lan.show && (
              <div className="flex flex-row ml-3 pb-0.5">
                <MdSettingsEthernet className="text-theme-800 dark:text-theme-200 w-4 h-4 mr-1" />
                <div
                  className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between"
                  title={t("unifi.users")}
                >
                  <div className="pr-0.5">
                    {t("common.number", {
                      value: lan.num_user,
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              </div>
            )}
            {((wlan.show && !lan.show) || (!wlan.show && lan.show)) && (
              <div className="flex flex-row ml-3 py-0.5">
                <BiNetworkChart className="text-theme-800 dark:text-theme-200 w-4 h-4 mr-1" />
                <div
                  className="text-theme-800 dark:text-theme-200 text-xs flex flex-row justify-between"
                  title={t("unifi.devices")}
                >
                  <div className="pr-0.5">
                    {t("common.number", {
                      value: wlan.show ? wlan.num_adopted : lan.num_adopted,
                      maximumFractionDigits: 0,
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </Raw>
    </Container>
  );
}
