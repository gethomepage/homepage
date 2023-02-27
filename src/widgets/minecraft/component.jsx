import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { data: serverData, error: serverError } = useWidgetAPI(widget, "status");
  const { t } = useTranslation();
  
  if(serverError){
    return <Container error={serverError} />;
  }
  if (!serverData) {
    return (
      <Container service={service}>
      <Block label="minecraft.status"/>
      <Block label="minecraft.players" />
      <Block label="minecraft.version" />
      </Container>
    );
  }
    
  const statusIndicator = serverData.online ? 
  <span className="text-green-500">{t("minecraft.up")}</span>:
  <span className="text-red-500">{t("minecraft.down")}</span>;
  
  if(serverData.players){
    return (
      <Container service={service}>
        <Block label="minecraft.status" value={statusIndicator} />
        <Block label="minecraft.players" value={`${serverData.players.online} / ${serverData.players.max}`} />
        <Block label="minecraft.version" value={serverData.version} />
      </Container>
    );
  } 
  return (
      <Container service={service}>
      <Block label="minecraft.status" value={statusIndicator} />
      <Block label="minecraft.players" value="-" />
      <Block label="minecraft.version" value="-" />
      </Container>
  );
}
     