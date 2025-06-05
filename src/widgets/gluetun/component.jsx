import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  if (!widget.fields) {
    widget.fields = ["public_ip", "region", "country"];
  }

  const { data: gluetunData, error: gluetunError } = useWidgetAPI(widget, "ip");
  const includePF = widget.fields.includes("port_forwarded");
  const { data: portForwardedData, error: portForwardedError } = useWidgetAPI(
    widget,
    includePF ? "port_forwarded" : "",
  );

  if (gluetunError || (includePF && portForwardedError)) {
    return <Container service={service} error={gluetunError || portForwardedError} />;
  }

  if (!gluetunData || (includePF && !portForwardedData)) {
    return (
      <Container service={service}>
        <Block label="gluetun.public_ip" />
        <Block label="gluetun.region" />
        <Block label="gluetun.country" />
        <Block label="gluetun.port_forwarded" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="gluetun.public_ip" value={gluetunData.public_ip} />
      <Block label="gluetun.region" value={gluetunData.region} />
      <Block label="gluetun.country" value={gluetunData.country} />
      <Block label="gluetun.port_forwarded" value={portForwardedData?.port} />
    </Container>
  );
}
