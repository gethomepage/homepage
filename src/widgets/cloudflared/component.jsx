import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "cfd_tunnel");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="cloudflared.status" />
        <Block label="cloudflared.origin_ip" />
      </Container>
    );
  }

  const originIP = statsData.result.connections?.origin_ip ?? statsData.result.connections[0]?.origin_ip;

  return (
    <Container service={service}>
      <Block label="cloudflared.status" value={statsData.result.status.charAt(0).toUpperCase() + statsData.result.status.slice(1)} />
      <Block label="cloudflared.origin_ip" value={originIP} />
    </Container>
  );
}
