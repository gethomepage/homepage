import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { data: stats, error: statsError } = useWidgetAPI(service.widget, "stats");
  const { data: events, error: eventsError } = useWidgetAPI(service.widget, "events");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (eventsError) {
    return <Container service={service} error={eventsError} />;
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
