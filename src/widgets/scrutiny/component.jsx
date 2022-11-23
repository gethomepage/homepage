import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: scrutinyData, error: scrutinyError } = useWidgetAPI(widget, "summary");

  if (scrutinyError) {
    return <Container error={scrutinyError} />;
  }

  if (!scrutinyData) {
    return (
      <Container service={service}>
        <Block label="scrutiny.passed" />
        <Block label="scrutiny.failed" />
        <Block label="scrutiny.unknown" />
      </Container>
    );
  }

  const deviceIds = Object.values(scrutinyData.data.summary);
  
  const passed = deviceIds.filter(deviceId => deviceId.device.device_status === 0)?.length || 0;
  const failed = deviceIds.filter(deviceId => deviceId.device.device_status > 0 && deviceId.device.device_status <= 3)?.length || 0;
  const unknown = deviceIds.length - (passed + failed) || 0;

  return (
    <Container service={service}>
      <Block label="scrutiny.passed" value={passed} />
      <Block label="scrutiny.failed" value={failed} />
      <Block label="scrutiny.unknown" value={unknown} />
    </Container>
  );
}
