import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: containersData, error: containersError } = useWidgetAPI(widget, "docker/containers/json", {
    all: 1,
  });

  if (containersError) {
    return <Container service={service} error={containersError} />;
  }

  if (!containersData) {
    return (
      <Container service={service}>
        <Block label="portainer.running" />
        <Block label="portainer.stopped" />
        <Block label="portainer.total" />
      </Container>
    );
  }

  if (containersData.error || !Array.isArray(containersData)) {
    // containersData can be itself an error object
    return <Container service={service} error={ containersData?.error ?? containersData } />;
  }

  const running = containersData.filter((c) => c.State === "running").length;
  const stopped = containersData.filter((c) => c.State === "exited").length;
  const total = containersData.length;

  return (
    <Container service={service}>
      <Block label="portainer.running" value={running} />
      <Block label="portainer.stopped" value={stopped} />
      <Block label="portainer.total" value={total} />
    </Container>
  );
}
