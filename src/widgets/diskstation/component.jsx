import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data: infoData, error: infoError } = useWidgetAPI(widget, "system_info");
  const { data: storageData, error: storageError } = useWidgetAPI(widget, "system_storage");
  const { data: utilizationData, error: utilizationError } = useWidgetAPI(widget, "utilization");

  if (storageError || infoError || utilizationError) {
    return <Container error={ storageError ?? infoError ?? utilizationError } />;
  }

  if (!storageData || !infoData || !utilizationData) {
    return (
      <Container service={service}>
        <Block label="diskstation.uptime" />
        <Block label="diskstation.volumeAvailable" />
        <Block label="resources.cpu" />
        <Block label="resources.mem" />
      </Container>
    );
  }

  // uptime info
  // eslint-disable-next-line no-unused-vars
  const [hour, minutes, seconds] = infoData.data.up_time.split(":");
  const days = Math.floor(hour / 24);
  const uptime = `${ t("common.number", { value: days }) } ${ t("diskstation.days") }`;

  // storage info
  const volumeName = widget.volume;

  let volume;

  if (volumeName) {
    volume = storageData.data.vol_info?.find(vol => vol.name === volumeName) 
  } else {
    volume = storageData.data.vol_info?.[0];
  }

  const usedBytes = parseFloat(volume?.used_size);
  const totalBytes = parseFloat(volume?.total_size);
  const freeBytes = totalBytes - usedBytes;

  // utilization info
  const { cpu, memory } = utilizationData.data;
  const cpuLoad = parseFloat(cpu.user_load) + parseFloat(cpu.system_load);
  const memoryUsage = 100 - ((100 * (parseFloat(memory.avail_real) + parseFloat(memory.cached))) / parseFloat(memory.total_real));

  return (
    <Container service={service}>
      <Block label="diskstation.uptime" value={ uptime } />
      <Block label="diskstation.volumeAvailable" value={ t("common.bbytes", { value: freeBytes, maximumFractionDigits: 1 }) } />
      <Block label="resources.cpu" value={ t("common.percent", { value: cpuLoad }) } />
      <Block label="resources.mem" value={ t("common.percent", { value: memoryUsage }) } />
    </Container>
  );
}
