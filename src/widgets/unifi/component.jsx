import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stat/sites");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  const defaultSite = widget.site
    ? statsData?.data.find((s) => s.desc === widget.site)
    : statsData?.data?.find((s) => s.name === "default");

  if (!defaultSite) {
    return (
      <Container service={service}>
        <Block label="unifi.uptime" />
        <Block label="unifi.wan" />
        <Block label="unifi.lan_users" />
        <Block label="unifi.wlan_users" />
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

  const uptime = wan["gw_system-stats"]
    ? `${t("common.number", { value: wan["gw_system-stats"].uptime / 86400, maximumFractionDigits: 1 })} ${t(
        "unifi.days",
      )}`
    : null;

  if (!(wan.show || lan.show || wlan.show || uptime)) {
    return (
      <Container service={service}>
        <Block value={t("unifi.empty_data")} />
      </Container>
    );
  }

  // If fields are not configured, set the dynamically determined fields.
  if (!widget.fields) {
    widget.fields = [];
    if (uptime) {
      widget.fields.push("unifi.uptime");
    }
    if (wan.show) {
      widget.fields.push("unifi.wan");
    }
    if (lan.show && !wlan.show) {
      widget.fields.push("unifi.lan_users");
      widget.fields.push("unifi.lan");
    }
    if (wlan.show) {
      widget.fields.push("unifi.wlan_users");
    }
    if (wlan.show && !lan.show) {
      widget.fields.push("unifi.wlan_devices");
      widget.fields.push("unifi.wlan");
    }
  }
  // Limit to the first 4 available
  widget.fields = widget.fields.slice(0, 4);

  return (
    <Container service={service}>
      <Block label="unifi.uptime" value={uptime} />
      <Block label="unifi.wan" value={wan.status === "ok" ? t("unifi.up") : t("unifi.down")} />
      <Block label="unifi.lan_users" value={t("common.number", { value: lan.num_user })} />
      <Block label="unifi.lan_devices" value={t("common.number", { value: lan.num_adopted })} />
      <Block label="unifi.lan" value={lan.up ? t("unifi.up") : t("unifi.down")} />
      <Block label="unifi.wlan_users" value={t("common.number", { value: wlan.num_user })} />
      <Block label="unifi.wlan_devices" value={t("common.number", { value: wlan.num_adopted })} />
      <Block label="unifi.wlan" value={wlan.up ? t("unifi.up") : t("unifi.down")} />
    </Container>
  );
}
