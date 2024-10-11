import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: infoData, error: infoError } = useWidgetAPI(widget, "client");

  if (!widget.fields) {
    widget.fields = ["connected", "enabled", "total"];
  }

  if (infoError || infoData?.statusCode > 400) {
    return <Container service={service} error={infoError ?? { message: infoData.statusMessage, data: infoData }} />;
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

  const enabled = infoData.filter((item) => item.enabled).length;
  const disabled = infoData.length - enabled;
  const connectionThreshold = (widget.threshold ?? 2) * 60 * 1000;
  const currentTime = new Date();
  const connected = infoData.filter(
    (item) => currentTime - new Date(item.latestHandshakeAt) < connectionThreshold,
  ).length;

  return (
    <Container service={service}>
      <Block label="wgeasy.connected" value={connected} />
      <Block label="wgeasy.enabled" value={enabled} />
      <Block label="wgeasy.disabled" value={disabled} />
      <Block label="wgeasy.total" value={infoData.length} />
    </Container>
  );
}
