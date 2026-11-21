import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { data: stats, error: statsError } = useWidgetAPI(service.widget, "stats");
  const { data: events, error: eventsError } = useWidgetAPI(service.widget, "events");

  const error = statsError || eventsError;

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!stats) {
    return (
      <Container service={service}>
        <Block label="vibenvr.status" />
        <Block label="vibenvr.online" />
        <Block label="vibenvr.events" />
        <Block label="vibenvr.archive" />
        <Block label="vibenvr.uptime" />
      </Container>
    );
  }

  const eventsCount = Array.isArray(events) ? events.length : 0;

  return (
    <Container service={service}>
      <Block label="vibenvr.status" value="RUNNING" />
      <Block label="vibenvr.online" value={stats.active_cameras} />
      <Block label="vibenvr.events" value={eventsCount} />
      <Block label="vibenvr.archive" value={stats.storage?.used_gb} />
      <Block label="vibenvr.uptime" value={stats.uptime} />
    </Container>
  );
}
