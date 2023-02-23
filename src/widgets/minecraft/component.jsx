import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
    const { widget } = service;
    const { data: serverData, error: serverError } = useWidgetAPI(widget, "status");
    if(serverError){
        return <Container error={serverError} />;
    }
    if (!serverData) {
        return (
          <Container service={service}>
            <Block label="minecraft.players" />
            <Block label="minecraft.version" />
          </Container>
        );
      }
    
      return (
        <Container service={service}>
          <Block label="minecraft.players" value={`${serverData.players.online} / ${serverData.players.max}`} />
          <Block label="minecraft.version" value={serverData.version} />
        </Container>
      );
}
