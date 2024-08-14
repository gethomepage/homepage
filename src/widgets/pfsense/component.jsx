import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const version = widget.version ?? 1;
  const { data: systemData, error: systemError } = useWidgetAPI(widget, version === 1 ? "system" : "systemv2");
  const { data: interfaceData, error: interfaceError } = useWidgetAPI(
    widget,
    version === 1 ? "interface" : "interfacev2",
  );

  const showWanIP = widget.fields?.filter((f) => f !== "wanIP").length <= 4 && widget.fields?.includes("wanIP");
  const showDiskUsage = widget.fields?.filter((f) => f !== "disk").length <= 4 && widget.fields?.includes("disk");

  if (systemError || interfaceError) {
    const finalError = systemError ?? interfaceError;
    return <Container service={service} error={finalError} />;
  }

  if (!systemData || !interfaceData) {
    return (
      <Container service={service}>
        <Block label="pfsense.load" />
        <Block label="pfsense.memory" />
        <Block label="pfsense.temp" />
        <Block label="pfsense.wanStatus" />
        {showWanIP && <Block label="pfsense.wanIP" />}
        {showDiskUsage && <Block label="pfsense.disk" />}
      </Container>
    );
  }

  const wan = interfaceData.data.filter((l) => l.hwif === widget.wan)[0];
  let memUsage = systemData?.data.mem_usage;
  let diskUsage = systemData.data.disk_usage;
  if (version === 1) {
    memUsage *= 100;
    diskUsage *= 100;
  }

  return (
    <Container service={service}>
      <Block
        label="pfsense.load"
        value={version === 1 ? systemData.data.load_avg[0] : systemData.data.cpu_load_avg[0]}
      />
      <Block label="pfsense.memory" value={t("common.percent", { value: memUsage.toFixed(2) })} />
      <Block
        label="pfsense.temp"
        value={t("common.number", { value: systemData.data.temp_c, style: "unit", unit: "celsius" })}
      />
      <Block
        label="pfsense.wanStatus"
        value={
          wan.status === "up" ? (
            <span className="text-green-500">{t("pfsense.up")}</span>
          ) : (
            <span className="text-red-500">{t("pfsense.down")}</span>
          )
        }
      />
      {showWanIP && <Block label="pfsense.wanIP" value={wan.ipaddr} />}
      {showDiskUsage && <Block label="pfsense.disk" value={t("common.percent", { value: diskUsage.toFixed(2) })} />}
    </Container>
  );
}
