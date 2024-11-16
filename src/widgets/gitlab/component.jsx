import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: gitlabEvents, error: gitlabEventsError } = useWidgetAPI(widget, "events");

  if (gitlabEventsError) {
    return <Container service={service} error={gitlabEvents} />;
  }

  if (!gitlabEvents) {
    return (
      <Container service={service}>
        <Block label="gitlab.events" />
        <Block label="gitlab.issues" />
        <Block label="gitlab.issuesOpen" />
        <Block label="gitlab.issuesClosed" />
        <Block label="gitlab.merges" />
        <Block label="gitlab.mergesOpen" />
        <Block label="gitlab.mergesClosed" />
      </Container>
    );
  }

  const issues = {
    open: gitlabEvents.issues.filter(event => event.action_name.toLowerCase() === "opened").length,
    closed: gitlabEvents.issues.filter(event => event.action_name.toLowerCase() === "closed").length,
    count: gitlabEvents.issues.length
  };

  const merges = {
    open: gitlabEvents.merges.filter(event => event.action_name.toLowerCase() === "opened").length,
    closed: gitlabEvents.merges.filter(event => event.action_name.toLowerCase() === "closed").length,
    count: gitlabEvents.merges.length
  };

  return (
    <Container service={service}>
      <Block label="gitlab.events" value={gitlabEvents.events} />
      <Block label="gitlab.issues" value={issues.count} />
      <Block label="gitlab.issuesOpen" value={issues.open} />
      <Block label="gitlab.issuesClosed" value={issues.closed} />
      <Block label="gitlab.merges" value={merges.count} />
      <Block label="gitlab.mergesOpen" value={merges.open} />
      <Block label="gitlab.mergesClosed" value={merges.closed} />
    </Container>
  );
}
