import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
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
        <Block label="gitlab.merges" />
      </Container>
    );
  }

  const openIssues = gitlabEvents.issues.filter((event) => event.action_name.toLowerCase() === "opened").length;
  const openMerges = gitlabEvents.merges.filter((event) => event.action_name.toLowerCase() === "opened").length;

  return (
    <Container service={service}>
      <Block label="gitlab.events" value={t("common.number", { value: gitlabEvents.events })} />
      <Block label="gitlab.issues" value={t("common.number", { value: openIssues })} />
      <Block label="gitlab.merges" value={t("common.number", { value: openMerges })} />
    </Container>
  );
}
