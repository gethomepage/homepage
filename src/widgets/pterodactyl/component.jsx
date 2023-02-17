
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {

  const {widget} = service;

  const {data: datasData, error: datasError} = useWidgetAPI(widget);

  if (datasError) {
    return <Container error={ datasError } />;
  }

  if (!datasData) {
    return (
      <Container service={service}>
        <Block label="pterodactyl.nodes" />
        <Block label="pterodactyl.servers" />
      </Container>
    );
  }
  return (
    <Container service={service}>
      <Block label="pterodactyl.nodes" value={datasData.nodes} />
      <Block label="pterodactyl.servers" value={datasData.servers} />
    </Container>
  );
}
