import { useTranslation } from "next-i18next";

import useWidgetAPI from "../../utils/proxy/use-widget-api";
import Container from "../../components/services/widget/container";
import Block from "../../components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: omadaData, error: omadaAPIError } = useWidgetAPI(widget, {
    refreshInterval: 5000,
  });

  if (omadaAPIError) {
    return <Container service={service} error={omadaAPIError} />;
  }

  if (!omadaData) {
    return (
      <Container service={service}>
        <Block label="omada.connectedAp" />
        <Block label="omada.activeUser" />
        <Block label="omada.alerts" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="omada.connectedAp" value={t( "common.number", { value: omadaData.connectedAp})} />
      <Block label="omada.activeUser" value={t( "common.number", { value: omadaData.activeUser })} />
      <Block label="omada.alerts" value={t( "common.number", { value: omadaData.alerts })} />
      { omadaData.connectedGateways > 0 && <Block label="omada.connectedGateway" value={t("common.number", { value: omadaData.connectedGateways})} /> }
    </Container>
  );
}
