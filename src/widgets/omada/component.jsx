
import { useTranslation } from "next-i18next";

import useWidgetAPI from "../../utils/proxy/use-widget-api";
import Container from "../../components/services/widget/container";
import Block from "../../components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: omadaData, error: omadaAPIError } = useWidgetAPI(widget, "unified", {
    refreshInterval: 5000,
  });

  if (omadaAPIError) {
    return <Container error={omadaAPIError} />;
  }

  if (!omadaData) {
    return (
      <Container service={service}>
        <Block label="omada.clients" />
        <Block label="plex.ap" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="omada.clients" value={t("common.number", { value: omada.clients })} />
      <Block label="omada.ap" value={t("common.number", { value: omada.ap })} />

    </Container>
  );
}
