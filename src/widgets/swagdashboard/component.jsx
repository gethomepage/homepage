import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: swagData, error: swagError } = useWidgetAPI(widget, "overview");

  if (swagError) {
    return <Container service={service} error={swagError} />;
  }

  if (!swagData) {
    return (
      <Container service={service}>
        <Block label="swagdashboard.proxied" />
        <Block label="swagdashboard.auth" />
        <Block label="swagdashboard.outdated" />
        <Block label="swagdashboard.banned" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="swagdashboard.proxied" value={swagData.proxied} />
      <Block label="swagdashboard.auth" value={swagData.auth} />
      <Block label="swagdashboard.outdated" value={swagData.outdated} />
      <Block label="swagdashboard.banned" value={swagData.banned} />
    </Container>
  );
}
