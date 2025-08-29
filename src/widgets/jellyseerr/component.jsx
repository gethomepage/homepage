import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const isIssueEnabled = widget.fields.includes("issues");

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "request/count");
  const { data: issueData, error: issueError } = useWidgetAPI(widget, isIssueEnabled ? "issue/count" : "");
  if (statsError || (isIssueEnabled && !issueData)) {
    return <Container service={service} error={statsError ? statsError : issueError} />;
  }

  if (!statsData || (isIssueEnabled && !issueData)) {
    return (
      <Container service={service}>
        {widget.fields.includes("pending") && <Block label="jellyseerr.pending" />}
        {widget.fields.includes("approved") && <Block label="jellyseerr.approved" />}
        {widget.fields.includes("available") && <Block label="jellyseerr.available" />}
        {widget.fields.includes("issues") && <Block label="jellyseerr.issues" />}
      </Container>
    );
  }

  return (
    <Container service={service}>
      {widget.fields.includes("pending") && <Block label="jellyseerr.pending" value={statsData.pending} />}
      {widget.fields.includes("approved") && <Block label="jellyseerr.approved" value={statsData.approved} />}
      {widget.fields.includes("available") && <Block label="jellyseerr.available" value={statsData.available} />}
      {widget.fields.includes("issues") && (
        <Block label="jellyseerr.issues" value={`${issueData.open} / ${issueData.total}`} />
      )}
    </Container>
  );
}
