import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: connectionData, error: connectionError } = useWidgetAPI(widget, "connections");
  const { data: completionData, error: completionError } = useWidgetAPI(widget, "completion");
  const { data: errorData, error: errorError } = useWidgetAPI(widget, "error");

  if (connectionError || completionError || errorError) {
    return <Container service={service} error={connectionError ?? completionError ?? errorError} />;
  }

  if (!connectionData || !completionData || !errorData) {
    return (
      <Container service={service}>
        <Block label="syncthing.connected" />
        <Block label="syncthing.synced" />
        <Block label="syncthing.errors" />
        <Block label="syncthing.storage" />
      </Container>
    );
  }

  const connections = Object.values(connectionData.connections);

  return (
    <Container service={service}>
      <Block
        label="syncthing.connected"
        value={`${t("common.number", { value: connections.filter((c) => c.connected).length })} / ${t("common.number", { value: connections.length })}`}
      />
      <Block label="syncthing.synced" value={t("common.percent", { value: completionData.completion })} />
      <Block
        label="syncthing.errors"
        value={t("common.number", { value: errorData.errors ? errorData.errors.length : 0 })}
      />
      <Block
        label="syncthing.storage"
        value={t("common.bytes", { value: completionData.globalBytes, maximumFractionDigits: 1, binary: true })}
      />
    </Container>
  );
}
