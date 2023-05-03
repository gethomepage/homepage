import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: nextcloudData, error: nextcloudError } = useWidgetAPI(widget, "serverinfo");

  if (nextcloudError) {
    return <Container service={service} error={nextcloudError} />;
  }
  
  // cpuload & memoryusage are deprecated, so limit to 4 fields
  const showCpuLoad = widget.fields?.includes('cpuload');
  const showMemoryUsage = widget.fields?.includes('memoryusage');
  const showNumFiles = !showCpuLoad || !showMemoryUsage; // at least 1 deprecated field is hidden
  const showNumShares = !showCpuLoad && !showMemoryUsage; // both deprecated fields are hidden

  if (!nextcloudData) {
    return (
      <Container service={service}>
        {showCpuLoad && <Block label="nextcloud.cpuload" />}
        {showMemoryUsage && <Block label="nextcloud.memoryusage" />}
        <Block label="nextcloud.freespace" />
        <Block label="nextcloud.activeusers" />
        {showNumFiles && <Block label="nextcloud.numfiles" />}
        {showNumShares && <Block label="nextcloud.numshares" />}
      </Container>
    );
  }

  const nextcloudInfo =  nextcloudData.ocs.data.nextcloud;
  const memoryUsage = 100 * ((parseFloat(nextcloudInfo.system.mem_total) - parseFloat(nextcloudInfo.system.mem_free)) / parseFloat(nextcloudInfo.system.mem_total));

  return (
    <Container service={service}>
      {showCpuLoad && <Block label="nextcloud.cpuload" value={t("common.percent", { value: nextcloudInfo.system.cpuload[0] })} />}
      {showMemoryUsage && <Block label="nextcloud.memoryusage" value={t("common.percent", { value:memoryUsage })} />}
      <Block label="nextcloud.freespace" value={t("common.bbytes", { value: nextcloudInfo.system.freespace, maximumFractionDigits: 1 })} />
      <Block label="nextcloud.activeusers" value={t("common.number", { value: nextcloudData.ocs.data.activeUsers.last24hours })} />
      {showNumFiles && <Block label="nextcloud.numfiles" value={t("common.number", { value: nextcloudInfo.storage.num_files })} />}
      {showNumShares && <Block label="nextcloud.numshares" value={t("common.number", { value: nextcloudInfo.shares.num_shares })} />}
    </Container>
  );
}
