import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "status");

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

  if (statsData.mode === "aggregate") {
    return (
      <Container service={service}>
        <Block label="cloudflared.healthy" value={statsData.healthy} />
        <Block label="cloudflared.unhealthy" value={statsData.unhealthy} />
        <Block label="cloudflared.total" value={statsData.total} />
      </Container>
    );
  }

  const originIP = statsData.origin_ip ?? "N/A";

  return (
    <Container service={service}>
      <Block
        label="cloudflared.status"
        value={statsData.status.charAt(0).toUpperCase() + statsData.status.slice(1)}
      />
      <Block label="cloudflared.origin_ip" value={originIP} />
    </Container>
  );
}
