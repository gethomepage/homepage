import { useTranslation } from "next-i18next";

import Error from "../components/error";
import Container from "../components/container";
import Block from "../components/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { data: quicklookData, errorL: quicklookError } = useWidgetAPI(service.widget, 'quicklook', {
    refreshInterval: 1000,
  });

  const { data: systemData, errorL: systemError } = useWidgetAPI(service.widget, 'system', {
    refreshInterval: 30000,
  });

  if (quicklookError) {
    return <Container><Error error={quicklookError} /></Container>;
  }

  if (systemError) {
    return <Container><Error error={systemError} /></Container>;
  }

  const dataCharts = [];

  if (quicklookData) {
    quicklookData.percpu.forEach((cpu, index) => {
      dataCharts.push({
        name: `CPU ${index}`,
        cpu: cpu.total,
        mem: quicklookData.mem,
        swap: quicklookData.swap,
        proc: quicklookData.cpu,
      });
    });
  }


  return (
    <Container className="bg-gradient-to-br from-theme-500/30 via-theme-600/20 to-theme-700/10">
      <Block position="top-3 right-3">
        {quicklookData && quicklookData.cpu_name && (
          <div className="text-[0.6rem] opacity-50">
            {quicklookData.cpu_name}
          </div>
        )}
      </Block>
      <Block position="bottom-3 left-3">
        {systemData && systemData.linux_distro && (
          <div className="text-xs opacity-50">
            {systemData.linux_distro}
          </div>
        )}
        {systemData && systemData.os_version && (
          <div className="text-xs opacity-50">
            {systemData.os_version}
          </div>
        )}
        {systemData && systemData.hostname && (
          <div className="text-xs opacity-75">
            {systemData.hostname}
          </div>
        )}
      </Block>

      <Block position="bottom-3 right-3 w-[4rem]">
        {quicklookData && quicklookData.cpu && (
          <div className="text-xs opacity-25 flex place-content-between">
            <div>{t("glances.cpu")}</div>
            <div className="opacity-75">
              {t("common.number", {
                value: quicklookData.cpu,
                style: "unit",
                unit: "percent",
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        )}

        {quicklookData && quicklookData.mem && (
          <div className="text-xs opacity-25 flex place-content-between">
            <div>{t("glances.mem")}</div>
            <div className="opacity-75">
              {t("common.number", {
                value: quicklookData.mem,
                style: "unit",
                unit: "percent",
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        )}

        {quicklookData && quicklookData.swap && (
          <div className="text-xs opacity-25 flex place-content-between">
            <div>{t("glances.swap")}</div>
            <div className="opacity-75">
              {t("common.number", {
                value: quicklookData.swap,
                style: "unit",
                unit: "percent",
                maximumFractionDigits: 0,
              })}
            </div>
          </div>
        )}
      </Block>
    </Container>
  );
}
