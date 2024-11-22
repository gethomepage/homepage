import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: gitlabEvents, error: gitlabEventsError } = useWidgetAPI(widget, "events");
  const { data: gitlabIssues, error: gitlabIssuesError } = useWidgetAPI(widget, "issues");
  const { data: gitlabMerges, error: gitlabMergesError } = useWidgetAPI(widget, "merges");

  if (gitlabEventsError || gitlabIssuesError || gitlabMergesError) {
    return <Container service={service} error={gitlabEventsError ?? gitlabIssuesError ?? gitlabMergesError} />;
  }

  if (!gitlabEvents || !gitlabIssues || !gitlabMerges) {
    return (
      <Container service={service}>
        <Block label="gitlab.events" />
        <Block label="gitlab.issues" />
        <Block label="gitlab.merges" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="gitlab.events" value={t("common.number", { value: gitlabEvents.count })} />
      <Block label="gitlab.issues" value={t("common.number", { value: gitlabIssues.count })} />
      <Block label="gitlab.merges" value={t("common.number", { value: gitlabMerges.count })} />
    </Container>
  );
}
