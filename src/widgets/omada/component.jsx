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
        <Block label="omada.alerts" />
        <Block label="omada.isolatedAp" />
        <Block label="omada.connectedGateway" />
        <Block label="omada.powerConsumption" />
        <Block label="omada.availablePorts" />
        <Block label="omada.connectedSwitches" />

      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="omada.connectedAp" value={t( "common.number", { value: omadaData.connectedAp})} />
      <Block label="omada.activeUser" value={t( "common.number", { value: omadaData.activeUser })} />
      <Block label="omada.alerts" value={t( "common.number", { value: omadaData.alerts })} />
      <Block label="omada.isolatedAp" value={t("common.number", { value: omadaData.isolatedAp})} />
      <Block label="omada.connectedGateway" value={t("common.number", { value: omadaData.connectedGateways})}/>
      <Block label="omada.powerConsumption" value={t("common.power", { value: omadaData.powerConsumption})}/>
      <Block label="omada.availablePorts" value={t("common.number", { value: omadaData.availablePorts})}/>
      <Block label="omada.connectedSwitches" value={t("common.number", { value: omadaData.connectedSwitches})} />

    </Container>
  );
}
