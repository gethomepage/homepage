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

  let status = <span className="text-orange-400">Pending check</span>;

  if (success) status = success ? msg : <span className="text-red-500">{msg}</span>;

  const formatTime = (time) => DateTime.fromISO(time).toLocaleString(DateTime.TIME_24_WITH_SECONDS);

  // Default fields to show if not configured
  const defaultFields = ["status", "ip_address", "last_check", "next_check"];
  const fields = widget.fields || defaultFields;

  return (
    <Container service={service}>
      {fields.includes("status") && <Block label="mousehole.status" value={status} />}
      {fields.includes("ip_address") && <Block label="mousehole.ip_address" value={stateData.host.ip} />}
      {fields.includes("last_check") && (
        <Block label="mousehole.last_check" value={formatTime(stateData.lastUpdate.at)} />
      )}
      {fields.includes("next_check") && (
        <Block label="mousehole.next_check" value={formatTime(stateData.nextUpdateAt)} />
      )}
    </Container>
  );
}
