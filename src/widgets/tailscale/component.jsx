import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "device");

  const MAX_ALLOWED_FIELDS = 4;

  if (!widget.fields?.length) {
    widget.fields = ["address", "last_seen", "expires"];
  }

  if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

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
    user,
    name,
    hostname,
    clientVersion,
    updateAvailable,
    os,
    created,
    keyExpiryDisabled,
    lastSeen,
    expires,
    authorized,
    isExternal,
    tags,
  } = statsData;

  const now = new Date();
  const compareDifferenceInTwoDates = (priorDate, futureDate) => {
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
  };

  const getLastSeen = () => {
    const date = new Date(lastSeen);
    const diff = compareDifferenceInTwoDates(date, now);
    return diff === "Now" ? t("tailscale.now") : t("tailscale.ago", { value: diff });
  };

  const getExpiry = () => {
    if (keyExpiryDisabled) return t("tailscale.never");
    const date = new Date(expires);
    return compareDifferenceInTwoDates(now, date);
  };

  return (
    <Container service={service}>
      <Block label="tailscale.address" value={address} />
      <Block label="tailscale.user" value={user} />
      <Block label="tailscale.hostname" value={hostname} />
      <Block label="tailscale.name" value={name} />
      <Block label="tailscale.last_seen" value={getLastSeen()} />
      <Block label="tailscale.expires" value={getExpiry()} />
      <Block label="tailscale.client_version" value={clientVersion} />
      <Block label="tailscale.os" value={os} />
      <Block label="tailscale.created" value={t("common.relativeDate", { value: created })} />
      <Block label="tailscale.authorized" value={authorized ? t("tailscale.yes") : t("tailscale.no")} />
      <Block label="tailscale.is_external" value={isExternal ? t("tailscale.yes") : t("tailscale.no")} />
      <Block label="tailscale.update_available" value={updateAvailable ? t("tailscale.yes") : t("tailscale.no")} />
      <Block label="tailscale.tags" value={tags?.length > 0 ? tags.join(", ") : t("tailscale.none")} />
    </Container>
  );
}
