import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "cfd_tunnel");

  if (statsError) {
    return <Container error={statsError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="cloudflared.status" />
        <Block label="cloudflared.origin_ip" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="cloudflared.status" value={statsData.result.status} />
      <Block label="cloudflared.origin_ip" value={statsData.result.connections.origin_ip} />
    </Container>
  );
}