import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: infoData, error: infoError } = useWidgetAPI(widget, "ceph/proxy-hosts");

  if (infoError) {
    return <Container service={service} error={infoError} />;
  }

  // Provide a default if not set in the config
  if (!widget.fields) {
    widget.fields = ["status", "alerts", "used"];
  }

  // Limit to a maximum of 4 at a time
  if (widget.fields.length > 4) {
    widget.fields = widget.fields.slice(0, 4);
  }
/*
        "status": "Status",
        "alerts": "Alerts",
        "freespace": "Free Space",
        "usedspace": "Used Space",
        "free": "Free",
        "used": "Used",
        "read": "Read",
        "write": "Write",
        "recovering": "Recovering"

        */
    
  if (!infoData) {
    return (
      <Container service={service}>
        <Block label="ceph.status" />
        <Block label="ceph.alerts" />
        <Block label="ceph.freespace" />
        <Block label="ceph.usedspace" />
        <Block label="ceph.free" />
        <Block label="ceph.used" />
        <Block label="ceph.read" />
        <Block label="ceph.write" />
        <Block label="ceph.recovering" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="ceph.status" value={infoData.health.status} />
      <Block label="ceph.alerts" value={infoData.health.checks?.length} />
      <Block label="ceph.freespace" value={t("common.bbytes", { value: infoData.df.stats.total_avail_bytes, maximumFractionDigits: 1 })} />
      <Block label="ceph.usedspace" value={t("common.bbytes", { value: infoData.df.stats.total_used_bytes, maximumFractionDigits: 1 })} />
      <Block label="ceph.free" value={t("common.percent", { value: (infoData.df.stats.total_avail_bytes / infoData.df.stats.total_bytes) * 100, maximumFractionDigits: 1 })} />
      <Block label="ceph.used" value={t("common.percent", { value: (infoData.df.stats.total_used_bytes / infoData.df.stats.total_bytes) * 100, maximumFractionDigits: 1 })} />
      <Block label="ceph.read" value={t("common.byterate", { value: infoData.client_perf.read_bytes_sec, maximumFractionDigits: 1 })} />
      <Block label="ceph.write" value={t("common.byterate", { value: infoData.client_perf.write_bytes_sec, maximumFractionDigits: 1 })} />
      <Block label="ceph.recovering" value={t("common.byterate", { value: infoData.client_perf.recovering_bytes_per_sec, maximumFractionDigits: 1 })} />
    </Container>
  );
}
