import { useTranslation } from "next-i18next";

import useWidgetAPI from "../../utils/proxy/use-widget-api";
import Container from "../../components/services/widget/container";
import Block from "../../components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: omadaData, error: omadaAPIError } = useWidgetAPI(widget, "stats", {
    refreshInterval: 5000,
  });

  if (omadaAPIError) {
    return <Container error={omadaAPIError} />;
  }

  if (!omadaData) {
    return (
      <Container service={service}>
        <Block label="omada.connectedAp" />
        <Block label="omada.activeUser" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="omada.connectedAp" value={t( "common.number", { value: omadaData.connectedAp})} />
      <Block label="omada.activeUser" value={t( "common.number", { value: omadaData.activeUser })} />
    </Container>
  );
}
