import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: projectsData, error: projectsError } = useWidgetAPI(widget, "projects");
  const { data: tasksData, error: tasksError } = useWidgetAPI(widget, "tasks", {
    filter: "done=false&&percent_done<1",
    sort_by: "due_date",
  });

  if (projectsError || tasksError) {
    const vikunjaError = projectsError ?? tasksError;
    return <Container service={service} error={vikunjaError} />;
  }

  if (!projectsData || !tasksData) {
    return (
      <Container service={service}>
        <Block label="vikunja.projects" />
        <Block label="vikunja.tasks7d" />
        <Block label="vikunja.tasksOverdue" />
        <Block label="vikunja.tasksInProgress" />
      </Container>
    );
  }

  const projects = projectsData.length;

  return (
    <Container service={service}>
      <Block label="vikunja.projects" value={t("common.number", { value: projects })} />
      <Block label="vikunja.tasks7d" value={t("common.number", { value: tasksData.tasks7d })} />
      <Block label="vikunja.tasksOverdue" value={t("common.number", { value: tasksData.overdue })} />
      <Block label="vikunja.tasksInProgress" value={t("common.number", { value: tasksData.inProgress })} />
    </Container>
  );
}
