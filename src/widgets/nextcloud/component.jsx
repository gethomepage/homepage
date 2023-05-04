import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: nextcloudData, error: nextcloudError } = useWidgetAPI(widget, "serverinfo");

  // Support for deprecated fields (cpuload, memoryusage)
  const [showCpuLoad, showMemoryUsage] = useMemo(() => {
    // Default values if fields is not set
    if (!widget.fields) return [false, false];

    // Allows for backwards compatibility with existing values of fields
    if (widget.fields.length <= 4) return [true, true];

    // If all fields are enabled, drop cpuload and memoryusage
    if (widget.fields.length === 6) return [false, false];

    const hasCpuLoad = widget.fields?.includes('cpuload');
    const hasMemoryUsage = widget.fields?.includes('memoryusage');
    
    // If (for some reason) 5 fields are set, drop memoryusage
    if (hasCpuLoad && hasMemoryUsage) return [true, false];
    return [!hasCpuLoad, !hasMemoryUsage]
  }, [widget.fields]);

  if (nextcloudError) {
    return <Container service={service} error={nextcloudError} />;
  }

  if (!nextcloudData) {
    return (
      <Container service={service}>
        {showCpuLoad && <Block label="nextcloud.cpuload" />}
        {showMemoryUsage && <Block label="nextcloud.memoryusage" />}
        <Block label="nextcloud.freespace" />
        <Block label="nextcloud.activeusers" />
        <Block label="nextcloud.numfiles" />
        <Block label="nextcloud.numshares" />
      </Container>
    );
  }

  const { nextcloud: nextcloudInfo, activeUsers } = nextcloudData.ocs.data;
  const memoryUsage = 100 * ((parseFloat(nextcloudInfo.system.mem_total) - parseFloat(nextcloudInfo.system.mem_free)) / parseFloat(nextcloudInfo.system.mem_total));

  return (
    <Container service={service}>
      {showCpuLoad && <Block label="nextcloud.cpuload" value={t("common.percent", { value: nextcloudInfo.system.cpuload[0] })} />}
      {showMemoryUsage && <Block label="nextcloud.memoryusage" value={t("common.percent", { value:memoryUsage })} />}
      <Block label="nextcloud.freespace" value={t("common.bbytes", { value: nextcloudInfo.system.freespace, maximumFractionDigits: 1 })} />
      <Block label="nextcloud.activeusers" value={t("common.number", { value: activeUsers.last24hours })} />
      <Block label="nextcloud.numfiles" value={t("common.number", { value: nextcloudInfo.storage.num_files })} />
      <Block label="nextcloud.numshares" value={t("common.number", { value: nextcloudInfo.shares.num_shares })} />
    </Container>
  );
}
