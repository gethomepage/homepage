import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "health");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="garage.status" />
        <Block label="garage.knownNodes" />
        <Block label="garage.connectedNodes" />
        <Block label="garage.storageNodes" />
        <Block label="garage.storageNodesOk" />
        <Block label="garage.partitions" />
        <Block label="garage.partitionsQuorum" />
        <Block label="garage.partitionsAllOk" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="garage.status" value={t(`garage.${data.status}`)} />
      <Block label="garage.knownNodes" value={t("common.number", { value: data.knownNodes })} />
      <Block label="garage.connectedNodes" value={t("common.number", { value: data.connectedNodes })} />
      <Block label="garage.storageNodes" value={t("common.number", { value: data.storageNodes })} />
      <Block label="garage.storageNodesOk" value={t("common.number", { value: data.storageNodesOk })} />
      <Block label="garage.partitions" value={t("common.number", { value: data.partitions })} />
      <Block label="garage.partitionsQuorum" value={t("common.number", { value: data.partitionsQuorum })} />
      <Block label="garage.partitionsAllOk" value={t("common.number", { value: data.partitionsAllOk })} />
    </Container>
  );
}
