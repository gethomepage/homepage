/* eslint no-underscore-dangle: ["error", { "allow": ["_text", "_cdata"] }] */

import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation("common");

  const { widget } = service;

  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");

  if (statusError) {
    return <Container service={service} error={statusError} />;
  }

  if (!statusData) {
    return (
      <Container service={service}>
        <Block label="qnap.cpuUsage" />
        <Block label="qnap.memUsage" />
        <Block label="qnap.systemTempC" />
        <Block label={(widget.volume) ? "qnap.volumeUsage" : "qnap.poolUsage" } />
      </Container>
    );
  }

  const cpuUsage = statusData.system.cpu_usage._cdata.replace(' %','');
  const totalMemory = statusData.system.total_memory._cdata;
  const freeMemory = statusData.system.free_memory._cdata;
  const systemTempC = statusData.system.cpu_tempc._text;
  let volumeTotalSize = 0;
  let volumeFreeSize = 0;
  let validVolume = true;

  if(Array.isArray(statusData.volume.volumeUseList.volumeUse)){
    if(widget.volume){
      const volumeSelected = statusData.volume.volumeList.volume.findIndex(vl => vl.volumeLabel._cdata === widget.volume);
      if(volumeSelected !== -1){
        volumeTotalSize = statusData.volume.volumeUseList.volumeUse[volumeSelected].total_size._cdata;
        volumeFreeSize = statusData.volume.volumeUseList.volumeUse[volumeSelected].free_size._cdata;
      }
      else{
        validVolume = false;
      }
    }else{
      statusData.volume.volumeUseList.volumeUse.forEach((volume) => {
        volumeTotalSize += Number(volume.total_size._cdata);
        volumeFreeSize += Number(volume.free_size._cdata);
      });  
    }
  }else{
    volumeTotalSize = statusData.volume.volumeUseList.volumeUse.total_size._cdata;
    volumeFreeSize = statusData.volume.volumeUseList.volumeUse.free_size._cdata;
  }

  return (
    <Container service={service}>
      <Block 
        label="qnap.cpuUsage" 
        value={t("common.percent", { value: (cpuUsage) })}
      />
      <Block
        label="qnap.memUsage"
        value={t("common.percent", { value: (((totalMemory - freeMemory) / totalMemory) * 100).toFixed(0) })}
      />
      <Block
        label="qnap.systemTempC"
        value={t("common.number", { value: systemTempC, maximumFractionDigits: 1, style: "unit", unit: "celsius" })} 
      />
      <Block
        label={(widget.volume) ? "qnap.volumeUsage" : "qnap.poolUsage" }
        value={(validVolume) ? t("common.percent", { value: (((volumeTotalSize - volumeFreeSize) / volumeTotalSize) * 100).toFixed(0) }) : "invalid"}
      />
    </Container>
  );
}
