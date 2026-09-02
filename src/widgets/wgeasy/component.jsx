import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const DEFAULT_FIELDS = ["connected", "enabled", "total"];

export default function Component({ service: configuredService }) {
  const service = withWidgetFields(configuredService, DEFAULT_FIELDS);
  const { widget } = service;

  const endpoint = widget.version === 2 ? "clientv2" : "client";

  const { data: infoData, error: infoError } = useWidgetAPI(widget, endpoint);

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
