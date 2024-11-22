import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: gitlabCounts, error: gitlabCountsError } = useWidgetAPI(widget, "counts");

  if (gitlabCountsError) {
    return <Container service={service} error={gitlabCountsError} />;
  }

  if (!gitlabCounts) {
    return (
      <Container service={service}>
        <Block label="gitlab.groups" />
        <Block label="gitlab.issues" />
        <Block label="gitlab.merges" />
        <Block label="gitlab.projects" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="gitlab.groups" value={t("common.number", { value: gitlabCounts.groups_count })} />
      <Block label="gitlab.issues" value={t("common.number", { value: gitlabCounts.issues_count })} />
      <Block label="gitlab.merges" value={t("common.number", { value: gitlabCounts.merge_requests_count })} />
      <Block label="gitlab.projects" value={t("common.number", { value: gitlabCounts.projects_count })} />
    </Container>
  );
}
