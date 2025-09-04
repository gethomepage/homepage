import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const version = widget.version ?? 1;
  const { data: systemData, error: systemError } = useWidgetAPI(widget, version === 1 ? "system" : "systemv2");
  const { data: interfaceData, error: interfaceError } = useWidgetAPI(
    widget,
    version === 1 ? "interface" : "interfacev2",
  );
  const { data: gatewayData, error: gatewayError } = useWidgetAPI(
    widget,
    version === 2 && widget.wan2 ? "gatewaysv2" : null,
  );
  const { data: gatewayGroupData, error: gatewayGroupError } = useWidgetAPI(
    widget,
    version === 2 && widget.wan2 ? "gatewaygroups" : null,
  );

  const showWanIP = widget.fields?.includes("wanIP");
  const showDiskUsage = widget.fields?.includes("disk");
  const showWan2Status = widget.wan2 && widget.fields?.includes("wan2Status");
  const showWan2IP = widget.wan2 && widget.fields?.includes("wan2IP");

  if (systemError || interfaceError) {
    const finalError = systemError ?? interfaceError;
    return <Container service={service} error={finalError} />;
  }

  if (!systemData || !interfaceData) {
    return (
      <Container service={service}>
        <Block label="pfsense.load" />
        <Block label="pfsense.memory" />
        <Block label="pfsense.temp" />
        <Block label="pfsense.wanStatus" />
        <Block label="pfsense.wanIP" />
        <Block label="pfsense.wan2Status" />
        <Block label="pfsense.wan2IP" />
        <Block label="pfsense.disk" />
      </Container>
    );
  }

  const wan = interfaceData.data.filter((l) => l.hwif === widget.wan)[0];
  const wan2 = widget.wan2 ? interfaceData.data.filter((l) => l.hwif === widget.wan2)[0] : null;

  // Determine which gateway is active based on failover group configuration
  let wan1GatewayStatus = null;
  let wan2GatewayStatus = null;
  let activeWan = null;
  let wan1IsPrimary = false;
  let wan2IsPrimary = false;
  let failoverGroup = null;

  // Only run gateway determination when wan2 is configured (dual WAN mode)
  if (widget.wan2 && gatewayData?.data && version === 2) {
    // Find the IPv4 failover group
    if (gatewayGroupData?.data) {
      failoverGroup = gatewayGroupData.data.find((g) => g.ipprotocol === "inet");
    }

    // Match gateway status to interfaces
    gatewayData.data.forEach((gw) => {
      if (wan?.ipaddr && gw.srcip === wan.ipaddr) {
        wan1GatewayStatus = gw;
      } else if (wan2?.ipaddr && gw.srcip === wan2.ipaddr) {
        wan2GatewayStatus = gw;
      }
    });

    // Determine active gateway based on failover group tiers and gateway status
    if (failoverGroup && wan1GatewayStatus && wan2GatewayStatus) {
      // Find which gateway is tier 1 (primary) and tier 2 (backup)
      const tier1Gateway = failoverGroup.priorities?.find((p) => p.tier === 1);
      const tier2Gateway = failoverGroup.priorities?.find((p) => p.tier === 2);

      // Match gateway names to determine which WAN is primary in the config
      wan1IsPrimary = tier1Gateway?.gateway === wan1GatewayStatus.name;
      wan2IsPrimary = tier1Gateway?.gateway === wan2GatewayStatus.name;

      // In failover mode, the active gateway is:
      // 1. The tier 1 gateway if it's online
      // 2. The tier 2 gateway if tier 1 is offline or has issues
      if (wan1IsPrimary) {
        // WAN1 is configured as primary
        if (wan1GatewayStatus.status === "online" && (wan1GatewayStatus.loss || 0) <= 20) {
          activeWan = "wan1";
        } else if (wan2GatewayStatus.status === "online") {
          activeWan = "wan2"; // Failover to backup
        }
      } else if (wan2IsPrimary) {
        // WAN2 is configured as primary
        if (wan2GatewayStatus.status === "online" && (wan2GatewayStatus.loss || 0) <= 20) {
          activeWan = "wan2";
        } else if (wan1GatewayStatus.status === "online") {
          activeWan = "wan1"; // Failover to backup
        }
      }
    } else if (wan1GatewayStatus && wan2GatewayStatus) {
      // Fallback: if no failover group, use simple online check
      const wan1Online = wan1GatewayStatus?.status === "online";
      const wan2Online = wan2GatewayStatus?.status === "online";

      if (wan1Online && !wan2Online) {
        activeWan = "wan1";
      } else if (!wan1Online && wan2Online) {
        activeWan = "wan2";
      } else if (wan1Online && wan2Online) {
        activeWan = "wan1"; // Default to WAN1 if both online
      }
    }
  }
  let memUsage = systemData?.data.mem_usage;
  let diskUsage = systemData.data.disk_usage;
  if (version === 1) {
    memUsage *= 100;
    diskUsage *= 100;
  }

  return (
    <Container service={service}>
      <Block
        label="pfsense.load"
        value={version === 1 ? systemData.data.load_avg[0] : systemData.data.cpu_load_avg[0]}
      />
      <Block label="pfsense.memory" value={t("common.percent", { value: memUsage.toFixed(2) })} />
      <Block
        label="pfsense.temp"
        value={t("common.number", { value: systemData.data.temp_c, style: "unit", unit: "celsius" })}
      />
      <Block
        label="pfsense.wanStatus"
        value={
          wan.status === "up" ? (
            <span className={activeWan === "wan1" ? "text-green-500 font-bold" : "text-green-500"}>
              {t("pfsense.up")}
              {widget.wan2 && (wan1IsPrimary ? " (Primary)" : " (Backup)")}
            </span>
          ) : (
            <span className="text-red-500">{t("pfsense.down")}</span>
          )
        }
      />
      <Block label="pfsense.wanIP" value={wan?.ipaddr} />
      <Block
        label="pfsense.wan2Status"
        value={
          wan2?.status === "up" ? (
            <span className={activeWan === "wan2" ? "text-green-500 font-bold" : "text-green-500"}>
              {t("pfsense.up")}
              {wan2IsPrimary ? " (Primary)" : " (Backup)"}
            </span>
          ) : wan2?.status ? (
            <span className="text-red-500">{t("pfsense.down")}</span>
          ) : (
            "-"
          )
        }
      />
      <Block label="pfsense.wan2IP" value={wan2?.ipaddr || "-"} />
      <Block label="pfsense.disk" value={diskUsage ? t("common.percent", { value: diskUsage.toFixed(2) }) : "-"} />
    </Container>
  );
}
