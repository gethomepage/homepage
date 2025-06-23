import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "request/count");
  const { data: issueData, error: issueError } = useWidgetAPI(widget, "issue/count");
  if (statsError || issueError) {
    return <Container service={service} error={statsError ? statsError : issueError} />;
  }

  if (!statsData || !issueData) {
    return (
      <Container service={service}>
        <Block label="jellyseerr.pending" />
        <Block label="jellyseerr.approved" />
        <Block label="jellyseerr.available" />
        <Block label="jellyseerr.issues" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="jellyseerr.pending" value={statsData.pending} />
      <Block label="jellyseerr.approved" value={statsData.approved} />
      <Block label="jellyseerr.available" value={statsData.available} />
      <Block label="jellyseerr.issues" value={`${issueData.open} / ${issueData.total}`} />
    </Container>
  );
}
