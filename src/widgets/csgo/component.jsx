import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { data: serverData, error: serverError } = useWidgetAPI(widget, "status");
  const { t } = useTranslation();

  if(serverError){
    return <Container service={service} error={serverError} />;
  }

  if (!serverData) {
    return (
      <Container service={service}>
      <Block label="csgo.map"/>
      <Block label="csgo.players" />
      <Block label="csgo.ping" />
      </Container>
    );
  }

  const map = serverData.online ? serverData.map : "-";
  const players = serverData.online ? `${serverData.players} / ${serverData.maxplayers}` : "-";
  const ping = serverData.online ? `${serverData.ping}` : 0;

  return (
    <Container service={service}>
      <Block label="csgo.map" value={map} />
      <Block label="csgo.players" value={players} />
      <Block label="csgo.ping" value={t("common.ms", { value: ping, style: "unit", unit: "millisecond" })} />
    </Container>
  );
}
