import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: tailscaleData, error: tailscaleError } = useWidgetAPI(widget, "device");

  if (tailscaleError || tailscaleData?.message) {
    return <Container service={service} error={tailscaleError ?? tailscaleData} />;
  }

  if (!tailscaleData) {
    return (
      <Container service={service}>
        <Block label="tailscale.address" />
        <Block label="tailscale.last_seen" />
        <Block label="tailscale.expires" />
      </Container>
    );
  }

  const MAX_ALLOWED_FIELDS = 4;
  if (widget.fields?.length == 0 || !widget.fields) {
    widget.fields = ["address", "last_seen", "expires"];
  } else if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  const {
    addresses: [address],
    keyExpiryDisabled,
    lastSeen,
    expires,
    user,
    hostname,
    name,
    clientVersion,
    os,
    created,
    authorized,
    isExternal,
    updateAvailable,
    tags,
  } = tailscaleData;

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

  const getBooleanAsString = (value) => {
    return value ? t("tailscale.true") : t("tailscale.false");
  };

  const clientVersionString = clientVersion ? clientVersion.toString() : "-";
  const tagsString = tags && Array.isArray(tags) ? tags.join(", ") : "-";

  return (
    <Container service={service}>
      <Block label="tailscale.address" value={address} />
      <Block label="tailscale.last_seen" value={getLastSeen()} />
      <Block label="tailscale.expires" value={getExpiry()} />
      <Block label="tailscale.user" value={user} />
      <Block label="tailscale.hostname" value={hostname} />
      <Block label="tailscale.name" value={name} />
      <Block label="tailscale.client_version" value={clientVersionString} />
      <Block label="tailscale.os" value={os} />
      <Block label="tailscale.created" value={created} />
      <Block label="tailscale.authorized" value={getBooleanAsString(authorized)} />
      <Block label="tailscale.is_external" value={getBooleanAsString(isExternal)} />
      <Block label="tailscale.update_available" value={getBooleanAsString(updateAvailable)} />
      <Block label="tailscale.tags" value={tagsString} />
    </Container>
  );
}
