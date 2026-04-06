import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";
import Device from "widgets/tailscale/device";

function compareDifferenceInTwoDates(t, priorDate, futureDate) {
  const diff = futureDate.getTime() - priorDate.getTime();
  const diffInYears = Math.ceil(diff / (1000 * 60 * 60 * 24 * 365));
  if (diffInYears > 1) return t("tailscale.years", { number: diffInYears });
  const diffInWeeks = Math.ceil(diff / (1000 * 60 * 60 * 24 * 7));
  if (diffInWeeks > 1) return t("tailscale.weeks", { number: diffInWeeks });
  const diffInDays = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (diffInDays > 1) return t("tailscale.days", { number: diffInDays });
  const diffInHours = Math.ceil(diff / (1000 * 60 * 60));
  if (diffInHours > 1) return t("tailscale.hours", { number: diffInHours });
  const diffInMinutes = Math.ceil(diff / (1000 * 60));
  if (diffInMinutes > 1) return t("tailscale.minutes", { number: diffInMinutes });
  const diffInSeconds = Math.ceil(diff / 1000);
  if (diffInSeconds > 10) return t("tailscale.seconds", { number: diffInSeconds });
  return "Now";
}

function SingleDevice({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "device");

  if (statsError || statsData?.message) {
    return <Container service={service} error={statsError ?? statsData} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="tailscale.address" />
        <Block label="tailscale.last_seen" />
        <Block label="tailscale.expires" />
      </Container>
    );
  }

  const {
    addresses: [address],
    keyExpiryDisabled,
    lastSeen,
    expires,
  } = statsData;

  const now = new Date();

  const getLastSeen = () => {
    const date = new Date(lastSeen);
    const diff = compareDifferenceInTwoDates(t, date, now);
    return diff === "Now" ? t("tailscale.now") : t("tailscale.ago", { value: diff });
  };

  const getExpiry = () => {
    if (keyExpiryDisabled) return t("tailscale.never");
    const date = new Date(expires);
    return compareDifferenceInTwoDates(t, now, date);
  };

  return (
    <Container service={service}>
      <Block label="tailscale.address" value={address} />
      <Block label="tailscale.last_seen" value={getLastSeen()} />
      <Block label="tailscale.expires" value={getExpiry()} />
    </Container>
  );
}

function TailnetDevices({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const summaryView = widget.summaryView !== false;

  const { data: devicesData, error: devicesError } = useWidgetAPI(widget, "devices");

  if (devicesError || devicesData?.message) {
    return <Container service={service} error={devicesError ?? devicesData} />;
  }

  if (!devicesData) {
    if (summaryView) {
      return (
        <Container service={service}>
          <Block label="tailscale.total_devices" />
          <Block label="tailscale.online" />
          <Block label="tailscale.offline" />
        </Container>
      );
    }
    return (
      <Container service={service}>
        <Block label="tailscale.total_devices" />
      </Container>
    );
  }

  const devices = Array.isArray(devicesData) ? devicesData : [];
  const online = devices.filter((d) => d.connectedToControl).length;
  const offline = devices.length - online;

  if (summaryView) {
    return (
      <Container service={service}>
        <Block label="tailscale.total_devices" value={t("common.number", { value: devices.length })} />
        <Block label="tailscale.online" value={t("common.number", { value: online })} />
        <Block label="tailscale.offline" value={t("common.number", { value: offline })} />
      </Container>
    );
  }

  return (
    <>
      <Container service={service}>
        <Block label="tailscale.total_devices" value={t("common.number", { value: devices.length })} />
        <Block label="tailscale.online" value={t("common.number", { value: online })} />
        <Block label="tailscale.offline" value={t("common.number", { value: offline })} />
      </Container>
      {devices
        .sort((a, b) => {
          if (a.connectedToControl !== b.connectedToControl) return a.connectedToControl ? -1 : 1;
          return a.name.localeCompare(b.name);
        })
        .map((device) => {
          const exitNodeRoutes = ["0.0.0.0/0", "::/0"];
          const advertisedRoutes = device.advertisedRoutes ?? [];
          const enabledRoutes = device.enabledRoutes ?? [];
          const isExitNode = advertisedRoutes.some((r) => exitNodeRoutes.includes(r));
          const hasSubnets = enabledRoutes.some((r) => !exitNodeRoutes.includes(r));

          return (
            <Device
              key={device.id}
              name={device.name}
              address={device.addresses?.[0]}
              online={device.connectedToControl}
              isExitNode={isExitNode}
              hasSubnets={hasSubnets}
              sshEnabled={device.sshEnabled}
            />
          );
        })}
    </>
  );
}

export default function Component({ service }) {
  const { widget } = service;

  if (widget.tailnet) {
    return <TailnetDevices service={service} />;
  }

  return <SingleDevice service={service} />;
}
