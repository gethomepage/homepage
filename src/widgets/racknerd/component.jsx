import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export const racknerdDefaultFields = ["ipAddress", "hddtotal", "bandwidthusage"];

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const params = {
    key: widget.key,
    hash: widget.hash,
  };
  const { data: racknerdData, error: racknerdError } = useWidgetAPI(widget, "serverinfo", {...params, action: 'info'});
  // Support for fields (harddriveusage, memoryusage, bandwidthusage)
  const [showIpAddress, showMemoryUsage, showHardDriveUsage, showBandwidthUsed, showBandwidthFree] = useMemo(() => {
    // Default values if fields is not set
    if (!widget.fields) return [true, false, true, true, true];

    const hasIpAddress = widget.fields?.includes("ipAddress") || false;
    const hasMemoryUsage = widget.fields?.includes("memoryusage") || false;
    const hasHardDriveUsage = widget.fields?.includes("hddtotal") || false;
    const hasBandwidthUsed = widget.fields?.includes("bandwidthused") || false;
    const hasBandwidthFree = widget.fields?.includes("bandwidthfree") || false;
    return [hasIpAddress, hasMemoryUsage, hasHardDriveUsage, hasBandwidthUsed, hasBandwidthFree];
  }, [widget.fields]);
  if (racknerdError) {
    return <Container service={service} error={racknerdError} />;
  }

  if (!racknerdData) {
    return (
      <Container service={service}>
        {showIpAddress && <Block label="racknerd.ipAddress" />}
        {showMemoryUsage && <Block label="racknerd.memoryusage" />}
        {showHardDriveUsage && <Block label="racknerd.hddtotal" />}
        {showBandwidthUsed && <Block label="racknerd.bandwidthused" />}
        {showBandwidthFree && <Block label="racknerd.bandwidthfree" />}
      </Container>
    );
  }
  const { racknerd: racknerdInfo } = racknerdData;
  return (
    <Container service={service}>
      {showIpAddress && (<Block 
        label="racknerd.ipAddress" 
        value={racknerdInfo.ipAddress} 
      />)}
      {showMemoryUsage && (<Block 
        label="racknerd.memoryusage" 
        value={t("common.bbytes", { value: racknerdInfo.system.memoryused, maximumFractionDigits: 1 })} 
      />)}
      {showHardDriveUsage && (<Block
        label="racknerd.hddtotal"
        value={t("common.bbytes", { value: racknerdInfo.system.hdd_total, maximumFractionDigits: 1 })}
      />)}
      {showBandwidthUsed && (<Block
        label="racknerd.bandwidthused"
        value={t("common.bbytes", { value: racknerdInfo.system.bandwidth_used, maximumFractionDigits: 1 })}
      />)}
      {showBandwidthFree && (<Block
        label="racknerd.bandwidthfree"
        value={t("common.bbytes", { value: racknerdInfo.system.bandwidth_free, maximumFractionDigits: 1 })}
      />)}
    </Container>
  );
}
