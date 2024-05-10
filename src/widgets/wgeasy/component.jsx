import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: infoData, error: infoError } = useWidgetAPI(widget);

  if (!widget.fields) {
    widget.fields = ["connected", "enabled", "total"];
  }

  if (infoError) {
    return <Container service={service} error={infoError} />;
  }

  if (!infoData) {
    return (
      <Container service={service}>
        <Block label="wgeasy.connected" />
        <Block label="wgeasy.enabled" />
        <Block label="wgeasy.disabled" />
        <Block label="wgeasy.total" />
      </Container>
    );
  }

  const total = infoData.length - 1;
  const enabled = infoData.filter((item) => item.enabled).length;
  const disabled = total - enabled;
  const connectionThreshold = infoData[infoData.length - 1].threshold * 60 * 1000;
  const currentTime = new Date();
  const connected = infoData.filter(
    (item) => currentTime - new Date(item.latestHandshakeAt) < connectionThreshold,
  ).length;

  return (
    <Container service={service}>
      <Block label="wgeasy.connected" value={connected} />
      <Block label="wgeasy.enabled" value={enabled} />
      <Block label="wgeasy.diabled" value={disabled} />
      <Block label="wgeasy.total" value={total} />
    </Container>
  );
}
