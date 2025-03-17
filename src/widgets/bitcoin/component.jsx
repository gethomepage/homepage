import { useTranslation } from "next-i18next";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation("common");

  const { widget } = service;

  const { data: blockchainInfo, error: infoError } = useWidgetAPI(widget, "blockchainInfo");
  const { data: networkInfo, error: networkError } = useWidgetAPI(widget, "networkInfo");

  if (infoError) {
    return <Container service={service} error={infoError} />;
  }

  if (networkError) {
    return <Container service={service} error={networkError} />;
  }

  if (!networkInfo || !blockchainInfo) {
    return (
      <Container service={service}>
        <Block label="bitcoin.blocks" />
        <Block label="bitcoin.connections_in" />
        <Block label="bitcoin.connections_out" />
        <Block label="bitcoin.size_on_disk" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="bitcoin.blocks" value={t("common.number", { value: blockchainInfo.blocks })} />
      <Block label="bitcoin.connections_in" value={networkInfo.connections_in} />
      <Block label="bitcoin.connections_out" value={networkInfo.connections_out} />
      <Block label="bitcoin.size_on_disk" value={t("common.bytes", { value: blockchainInfo.size_on_disk })} />
    </Container>
  );
}
