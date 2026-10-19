import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const DEFAULT_FIELDS = ["online", "users", "version", "current_version"];

// Compares two NetBird release strings (e.g. "0.76.2"). Returns true when
// "version" is older than "reference". Unknown or empty versions never count
// as outdated, otherwise a peer that has not reported yet raises a false alarm.
function isOlder(version, reference) {
  if (!version || !reference) return false;

  const left = version.split(".").map((part) => parseInt(part, 10));
  const right = reference.split(".").map((part) => parseInt(part, 10));

  if (left.some(Number.isNaN) || right.some(Number.isNaN)) return false;

  for (let i = 0; i < Math.max(left.length, right.length); i += 1) {
    const a = left[i] ?? 0;
    const b = right[i] ?? 0;
    if (a !== b) return a < b;
  }

  return false;
}

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();

  const service = withWidgetFields(configuredService, DEFAULT_FIELDS);
  const { widget } = service;

  // The user list requires an admin token, so it is only requested when the
  // field is displayed. An empty endpoint makes useWidgetAPI skip the call.
  const usersEndpoint = widget.fields.includes("users") ? "users" : "";

  const { data: peersData, error: peersError } = useWidgetAPI(widget, "peers");
  const { data: versionData, error: versionError } = useWidgetAPI(widget, "version");
  const { data: usersData, error: usersError } = useWidgetAPI(widget, usersEndpoint);

  const error = peersError ?? versionError ?? usersError;

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!peersData || !versionData || (usersEndpoint && !usersData)) {
    return (
      <Container service={service}>
        <Block label="netbird.online" />
        <Block label="netbird.users" />
        <Block label="netbird.version" />
        <Block label="netbird.current_version" />
      </Container>
    );
  }

  const peers = Array.isArray(peersData) ? peersData : [];
  const users = Array.isArray(usersData) ? usersData : [];

  const currentVersion = versionData.management_current_version;

  const online = peers.filter((peer) => peer.connected).length;
  const loginExpired = peers.filter((peer) => peer.login_expired).length;
  const outdated = peers.filter((peer) => isOlder(peer.version, currentVersion)).length;
  const humanUsers = users.filter((user) => !user.is_service_user).length;

  const versionStatus = versionData.management_update_available
    ? t("netbird.update_available")
    : t("netbird.up_to_date");

  return (
    <Container service={service}>
      <Block label="netbird.peers" value={t("common.number", { value: peers.length })} />
      <Block
        label="netbird.online"
        value={`${t("common.number", { value: online })} / ${t("common.number", { value: peers.length })}`}
      />
      <Block label="netbird.users" value={t("common.number", { value: humanUsers })} />
      <Block label="netbird.login_expired" value={t("common.number", { value: loginExpired })} />
      <Block label="netbird.outdated" value={t("common.number", { value: outdated })} />
      <Block label="netbird.version" value={versionStatus} />
      <Block label="netbird.current_version" value={currentVersion} />
    </Container>
  );
}
