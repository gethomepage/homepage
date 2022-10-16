import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
    const { t } = useTranslation();

    const { widget } = service;

    const { data: statsData, error: statsError } = useWidgetAPI(widget, "stat/sites");

    if (statsError || statsData?.error) {
        return <Container error={t("widget.api_error")} />;
    }

    const defaultSite = statsData?.data?.find(s => s.name === "default");

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

    const wan = defaultSite.health.find(h => h.subsystem === "wan");
    const lan = defaultSite.health.find(h => h.subsystem === "lan");
    const wlan = defaultSite.health.find(h => h.subsystem === "wlan");
    [wan, lan, wlan].forEach(s => {
        s.up = s.status === "ok" // eslint-disable-line no-param-reassign
        s.show = s.status !== "unknown" // eslint-disable-line no-param-reassign
    });

    const uptime = wan["gw_system-stats"] ? `${t("common.number", { value: wan["gw_system-stats"].uptime / 86400, maximumFractionDigits: 1 })} ${t("unifi.days")}` : null;

    return (
        <Container service={service}>
            {uptime && <Block label="unifi.uptime" value={ uptime } />}
            {wan.show && <Block label="unifi.wan" value={ wan.up ? t("unifi.up") : t("unifi.down") } />}
            
            {lan.show && <Block label="unifi.lan_users" value={ t("common.number", { value: lan.num_user }) } />}
            {lan.show && !wlan.show && <Block label="unifi.lan_devices" value={ t("common.number", { value: lan.num_adopted }) } />}
            {lan.show && !wlan.show && <Block label="unifi.lan" value={ lan.up ? t("unifi.up") : t("unifi.down") } />}
            
            {wlan.show && <Block label="unifi.wlan_users" value={ t("common.number", { value: wlan.num_user }) } />}
            {wlan.show && !lan.show && <Block label="unifi.wlan_devices" value={ t("common.number", { value: wlan.num_adopted }) } />}
            {wlan.show && !lan.show && <Block label="unifi.wlan" value={ wlan.up ? t("unifi.up") : t("unifi.down") } />}
        </Container>
    );
}
