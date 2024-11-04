import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: nodeData, error: nodeError } = useWidgetAPI(widget, "node");

  if (nodeError) {
    return <Container service={service} error={nodeError} />;
  }

  if (!nodeData) {
    return (
      <Container service={service}>
        <Block label="headscale.name" />
        <Block label="headscale.address" />
        <Block label="headscale.last_seen" />
        <Block label="headscale.status" />
      </Container>
    );
  }

  const {
    givenName,
    ipAddresses: [address],
    lastSeen,
    online,
  } = nodeData.node;

  return (
    <Container service={service}>
      <Block label="headscale.name" value={givenName} />
      <Block label="headscale.address" value={address} />
      <Block label="headscale.last_seen" value={t("common.relativeDate", { value: lastSeen })} />
      <Block label="headscale.status" value={t(online ? "headscale.online" : "headscale.offline")} />
    </Container>
  );
}
