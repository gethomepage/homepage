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

  if (projectsError || tasksError) {
    const vikunjaError = projectsError ?? tasksError;
    return <Container service={service} error={vikunjaError} />;
  }

  if (!projectsData || !tasksData) {
    return (
      <Container service={service}>
        <Block label="vikunja.projects" />
        <Block label="vikunja.tasks" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="vikunja.projects" value={t("common.number", { value: projectsData.projects })} />
      <Block label="vikunja.tasks" value={t("common.number", { value: tasksData.tasks })} />
    </Container>
  );
}
