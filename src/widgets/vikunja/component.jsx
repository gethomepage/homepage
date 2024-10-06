import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: projectsData, error: projectsError } = useWidgetAPI(widget, "projects");
  const { data: tasksData, error: tasksError } = useWidgetAPI(widget, "tasks", {
    filter: "done=false&&due_date<=now+7d",
  });
  const { data: overdueData, error: overdueError } = useWidgetAPI(widget, "tasks", {
    filter: "done=false&&due_date<=now",
  });
  const { data: inProgressData, error: inProgressError } = useWidgetAPI(widget, "tasks", {
    filter: "done=false&&percent_done>0&&percent_done<100",
  });

  if (projectsError || tasksError || overdueError || inProgressError) {
    const vikunjaError = projectsError ?? tasksError ?? overdueError ?? inProgressError;
    return <Container service={service} error={vikunjaError} />;
  }

  if (!projectsData || !tasksData || !overdueData || !inProgressData) {
    return (
      <Container service={service}>
        <Block label="vikunja.projects" />
        <Block label="vikunja.tasks" />
        <Block label="vikunja.overdue" />
        <Block label="vikunja.inprogress" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="vikunja.projects" value={t("common.number", { value: projectsData.projects })} />
      <Block label="vikunja.tasks" value={t("common.number", { value: tasksData.tasks })} />
      <Block label="vikunja.overdue" value={t("common.number", { value: overdueData.tasks })} />
      <Block label="vikunja.inprogress" value={t("common.number", { value: inProgressData.tasks })} />
    </Container>
  );
}
