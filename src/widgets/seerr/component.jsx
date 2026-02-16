import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export const seerrDefaultFields = ["pending", "approved", "completed"];
const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { widget } = service;
  widget.fields = widget?.fields?.length ? widget.fields.slice(0, MAX_ALLOWED_FIELDS) : seerrDefaultFields;
  const isIssueEnabled = widget.fields.includes("issues");

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "request/count");
  const { data: issueData, error: issueError } = useWidgetAPI(widget, isIssueEnabled ? "issue/count" : "");
  if (statsError || (isIssueEnabled && issueError)) {
    return <Container service={service} error={statsError ? statsError : issueError} />;
  }

  if (!statsData || (isIssueEnabled && !issueData)) {
    return (
      <Container service={service}>
        <Block field="seerr.pending" label="seerr.pending" />
        <Block field="seerr.approved" label="seerr.approved" />
        <Block field="seerr.available" label="seerr.available" />
        <Block field="seerr.completed" label="seerr.completed" />
        <Block field="seerr.processing" label="seerr.processing" />
        <Block field="seerr.issues" label="seerr.issues" />
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
      <Block field="seerr.pending" label="seerr.pending" value={statsData.pending} />
      <Block field="seerr.approved" label="seerr.approved" value={statsData.approved} />
      <Block field="seerr.available" label="seerr.available" value={statsData.available} />
      <Block field="seerr.completed" label="seerr.completed" value={statsData.completed} />
      <Block field="seerr.processing" label="seerr.processing" value={statsData.processing} />
      <Block field="seerr.issues" label="seerr.issues" value={`${issueData?.open} / ${issueData?.total}`} />
    </Container>
  );
}
