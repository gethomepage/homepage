import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export const jellyseerrDefaultFields = ["pending", "approved", "completed"];
const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { widget } = service;

  widget.fields = widget?.fields?.length ? widget.fields.slice(0, MAX_ALLOWED_FIELDS) : jellyseerrDefaultFields;
  const isIssueEnabled = widget.fields.includes("issues");

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "request/count");
  const { data: issueData, error: issueError } = useWidgetAPI(widget, isIssueEnabled ? "issue/count" : "");
  if (statsError || (isIssueEnabled && issueError)) {
    return <Container service={service} error={statsError ? statsError : issueError} />;
  }

  if (!statsData || (isIssueEnabled && !issueData)) {
    return (
      <Container service={service}>
        <Block label="jellyseerr.pending" />
        <Block label="jellyseerr.approved" />
        <Block label="jellyseerr.available" />
        <Block label="jellyseerr.completed" />
        <Block label="jellyseerr.issues" />
      </Container>
    );
  }

  if (statsData.completed === undefined) {
    // Newer versions added "completed", fallback to available
    widget.fields = widget.fields.filter((field) => field !== "completed");
    widget.fields.push("available");
  }

  return (
    <Container service={service}>
      <Block label="jellyseerr.pending" value={statsData.pending} />
      <Block label="jellyseerr.approved" value={statsData.approved} />
      <Block label="jellyseerr.available" value={statsData.available} />
      <Block label="jellyseerr.completed" value={statsData.completed} />
      <Block label="jellyseerr.issues" value={`${issueData?.open} / ${issueData?.total}`} />
    </Container>
  );
}
