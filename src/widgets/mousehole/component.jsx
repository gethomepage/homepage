import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { DateTime } from "luxon";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { data: stateData, error: stateError } = useWidgetAPI(widget, "state");

  if (stateError) {
    return <Container service={service} error={stateError} />;
  }

  if (!stateData) {
    return (
      <Container service={service}>
        <Block label="mousehole.status" />
        <Block label="mousehole.ip_address" />
        <Block label="mousehole.last_check" />
        <Block label="mousehole.next_check" />
      </Container>
    );
  }

  const { msg, Success: success } = stateData.lastMam.response.body;
  const status = success ? <span className="text-green-500">{msg}</span> : <span className="text-red-500">{msg}</span>;
  const formatTime = (time) => DateTime.fromISO(time).toLocaleString(DateTime.TIME_24_WITH_SECONDS);

  return (
    <Container service={service}>
      <Block label="mousehole.status" value={status} />
      <Block label="mousehole.ip_address" value={stateData.host.ip} />
      <Block label="mousehole.last_check" value={formatTime(stateData.lastUpdate.at)} />
      <Block label="mousehole.next_check" value={formatTime(stateData.nextUpdateAt)} />
    </Container>
  );
}
