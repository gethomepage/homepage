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

    const wlanLabel = `${t("unifi.wlan")} ${t("unifi.users")}`
    const lanLabel = `${t("unifi.lan")} ${t("unifi.users")}`

    const defaultSite = statsData?.data?.find(s => s.name === "default");

    if (!defaultSite) {
        return (
        <Container service={service}>
            <Block label="unifi.uptime" />
            <Block label="unifi.wan" />
            <Block label={ lanLabel } />
            <Block label={ wlanLabel } />
        </Container>
        );
    }

    const wan = defaultSite.health.find(h => h.subsystem === "wan");
    const lan = defaultSite.health.find(h => h.subsystem === "lan");
    const wlan = defaultSite.health.find(h => h.subsystem === "wlan");
    const data = {
        name: wan.gw_name,
        uptime: wan["gw_system-stats"].uptime,
        up: wan.status === 'ok',
        wlan: {
            users: wlan.num_user,
            status: wlan.status
        },
        lan: {
            users: lan.num_user,
            status: lan.status
        }
    };

    const uptime = `${t("common.number", { value: data.uptime / 86400, maximumFractionDigits: 1 })} ${t("unifi.days")}`;

    return (
        <Container service={service}>
            <Block label="unifi.uptime" value={ uptime } />
            <Block label="unifi.wan" value={ data.up ? t("unifi.up") : t("unifi.down") } />
            <Block label={ lanLabel } value={t("common.number", { value: data.lan.users })} />
            <Block label={ wlanLabel } value={t("common.number", { value: data.wlan.users })} />
        </Container>
    );
}
