import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: traefikData, error: traefikError } = useWidgetAPI(widget, "overview");

  if (traefikError) {
    return <Container service={service} error={traefikError} />;
  }

  if (!traefikData) {
    return (
      <Container service={service}>
        <Block label="traefik.routers" />
        <Block label="traefik.services" />
        <Block label="traefik.middleware" />
      </Container>
    );
  }

  const routers =
    traefikData.http.routers.total +
    (traefikData.tcp?.routers?.total ?? 0) +
    (traefikData.udp?.routers?.total ?? 0);
  const services =
    traefikData.http.services.total +
    (traefikData.tcp?.services?.total ?? 0) +
    (traefikData.udp?.services?.total ?? 0);
  const middlewares =
    traefikData.http.middlewares.total +
    (traefikData.tcp?.middlewares?.total ?? 0) +
    (traefikData.udp?.middlewares?.total ?? 0);

  return (
    <Container service={service}>
      <Block label="traefik.routers" value={routers} />
      <Block label="traefik.services" value={services} />
      <Block label="traefik.middleware" value={middlewares} />
    </Container>
  );
}
