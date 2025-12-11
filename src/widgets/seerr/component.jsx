import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export const seerrDefaultFields = ["pending", "approved", "available"];

export default function Component({ service }) {
  const { widget } = service;

  widget.fields = widget?.fields?.length ? widget.fields : seerrDefaultFields;
  const isIssueEnabled = widget.fields.includes("issues");

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "request/count");
  const { data: issueData, error: issueError } = useWidgetAPI(widget, isIssueEnabled ? "issue/count" : "");
  if (statsError || (isIssueEnabled && issueError)) {
    return <Container service={service} error={statsError ? statsError : issueError} />;
  }

  if (!statsData || (isIssueEnabled && !issueData)) {
    return (
      <Container service={service}>
        <Block label="seerr.pending" />
        <Block label="seerr.approved" />
        <Block label="seerr.available" />
        <Block label="seerr.issues" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="seerr.pending" value={statsData.pending} />
      <Block label="seerr.approved" value={statsData.approved} />
      <Block label="seerr.available" value={statsData.available} />
      <Block label="seerr.issues" value={`${issueData?.open} / ${issueData?.total}`} />
    </Container>
  );
}
