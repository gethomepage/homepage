import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: nodesData, error: nodesError } = useWidgetAPI(widget, "nodes");
  const { data: serversData, error: serversError } = useWidgetAPI(widget, "servers");

  if (nodesError) {
    return <Container service={service} error={nodesError} />;
  }

  if (serversError) {
    return <Container service={service} error={serversError} />;
  }

  if (!nodesData || !serversData) {
    return (
      <Container service={service}>
        <Block label="nodes" />
        <Block label="servers" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="nodes" value={nodesData.data.length} />
      <Block label="servers" value={serversData.data.length} />
    </Container>
  );
}
