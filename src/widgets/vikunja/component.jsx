import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

// return Projects that are not Saved Filters
function getRealProjects(project) {
  return project.id > 0;
}

// return Tasks that have a real due date in 7 days or less
function get7dTasks(task) {
  return (
    new Date(task.dueDate).getTime() > new Date("0001-01-01T00:00:00Z").getTime() &&
    new Date(task.dueDate).getTime() <= new Date(Date.now() + 604800000)
  );
}

// return Tasks that have a real due date in the past
function getOverdue(task) {
  return (
    new Date(task.dueDate).getTime() > new Date("0001-01-01T00:00:00Z").getTime() &&
    new Date(task.dueDate).getTime() <= new Date(Date.now())
  );
}

// return Tasks that are not 100% complete
function getInProgress(task) {
  return task.inProgress === true;
}

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

  const projects = projectsData.filter(getRealProjects);
  const tasks7d = tasksData.filter(get7dTasks);
  const overdue = tasksData.filter(getOverdue);
  const inProgress = tasksData.filter(getInProgress);

  return (
    //    <>
    <Container service={service}>
      <Block label="vikunja.projects" value={t("common.number", { value: projects.length })} />
      <Block label="vikunja.tasks7d" value={t("common.number", { value: tasks7d.length })} />
      <Block label="vikunja.tasksOverdue" value={t("common.number", { value: overdue.length })} />
      <Block label="vikunja.tasksInProgress" value={t("common.number", { value: inProgress.length })} />
    </Container>
  );
}
