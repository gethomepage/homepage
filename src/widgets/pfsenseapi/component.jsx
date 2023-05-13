import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: systemData, error: systemError } = useWidgetAPI(widget, "system");
  const { data: interfaceData, error: interfaceError } = useWidgetAPI(widget, "interface");

  const showDiskUsage = widget.fields?.includes('disk');
  const showWanIP = widget.fields?.includes('wanIP');
  
  if (systemError || interfaceError) {
    const finalError = systemError ?? interfaceError;
    return <Container service={service} error={ finalError } />;
  }

  if (!systemData || !interfaceData) {
    return (
      <Container service={service}>      
        <Block label="pfsenseapi.cpu" />
        <Block label="pfsenseapi.memory" />
        {showDiskUsage && <Block label="pfsenseapi.disk" />}
        <Block label="pfsenseapi.temp" />
        <Block label="pfsenseapi.wanStatus" />  
        {showWanIP && <Block label="pfsenseapi.wanIP" />}
      </Container>
    );
  }

  const loadAvg = systemData.data.load_avg[0];
  const memory = systemData.data.mem_usage;
  const tempC = systemData.data.temp_c
  const disk = systemData.data.disk_usage

  const wanState = interfaceData.data.filter(l => l.hwif === widget.wan)[0].status
  const wanStatus = (wanState === "up") ? 
    <span className="text-green-500">{t("pfsenseapi.up")}</span>:
    <span className="text-red-500">{t("pfsenseapi.down")}</span>;
  const wanIP = interfaceData.data.filter(l => l.hwif === widget.wan)[0].ipaddr

  return (
    <Container service={service}>
      <Block 
        label="pfsenseapi.load" 
        value={loadAvg}  
      />
      <Block 
        label="pfsenseapi.memory" 
        value={t("common.percent", { value: (memory * 100).toFixed(2) })}  
      />
      {
        showDiskUsage 
        && 
        <Block 
          label="pfsenseapi.disk" 
          value={t("common.percent", { value: (disk * 100).toFixed(2) })} 
        />
      }
      <Block 
        label="pfsenseapi.temp" 
        value={`${tempC} °C`} 
      />
      <Block 
        label="pfsenseapi.wanStatus" 
        value={wanStatus}
      />
      {
        showWanIP 
        && 
        <Block 
          label="pfsenseapi.wanIP" 
          value={wanIP} 
        />
      }
    </Container>
  );
}
