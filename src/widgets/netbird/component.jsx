import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: peersData, error: peersError } = useWidgetAPI(widget, "peers");
  const { data: routesData, error: routesError } = useWidgetAPI(widget, "routes");

  if (peersError || routesError) {
    const finalError = peersError ?? routesError;
    return <Container service={service} error={finalError} />;
  }

  if (!peersData || !routesData) {
    return (
      <Container service={service}>
        <Block label="netbird.online" />
        <Block label="netbird.offline" />
        <Block label="netbird.total" />
        <Block label="netbird.routes" />
      </Container>
    );
  }

  const totalPeers = peersData.length;
  const onlinePeers = peersData.filter((peer) => peer.connected === true).length;
  const offlinePeers = totalPeers - onlinePeers;
  const totalRoutes = routesData.length;

  return (
    <Container service={service}>
      <Block label="netbird.online" value={onlinePeers} />
      <Block label="netbird.offline" value={offlinePeers} />
      <Block label="netbird.total" value={totalPeers} />
      <Block label="netbird.routes" value={totalRoutes} />
    </Container>
  );
}
