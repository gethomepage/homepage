import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "device");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="tailscale.status" />
        <Block label="tailscale.private_ip" />
      </Container>
    );
  }

  const getStatus = () => {
    const { endpoints, latency } = statsData.clientConnectivity
    return (endpoints.length === 0 || Object.keys(latency).length === 0) ? "Offline" : "Online"
  }
  

  const privateIP = statsData.addresses[0]

  return (
    <Container service={service}>
      <Block label="tailscale.status" value={getStatus()} />
      <Block label="tailscale.private_ip" value={privateIP} />
    </Container>
  );
}
