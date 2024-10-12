import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: projectsData, error: projectsError } = useWidgetAPI(widget, "projects");
  const { data: tasksData, error: tasksError } = useWidgetAPI(widget, "tasks");

  if (projectsError || tasksError) {
    return <Container service={service} error={projectsError ?? tasksError} />;
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

  const projects = projectsData.filter((project) => project.id > 0); // saved filters have id < 0

  const oneWeekFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const tasksWithDueDate = tasksData.filter((task) => !task.dueDateIsDefault);
  const tasks7d = tasksWithDueDate.filter((task) => new Date(task.dueDate) <= oneWeekFromNow);
  const tasksOverdue = tasksWithDueDate.filter((task) => new Date(task.dueDate) <= new Date(Date.now()));
  const tasksInProgress = tasksData.filter((task) => task.inProgress);

  return (
    <>
      <Container service={service}>
        <Block label="vikunja.projects" value={t("common.number", { value: projects.length })} />
        <Block label="vikunja.tasks7d" value={t("common.number", { value: tasks7d.length })} />
        <Block label="vikunja.tasksOverdue" value={t("common.number", { value: tasksOverdue.length })} />
        <Block label="vikunja.tasksInProgress" value={t("common.number", { value: tasksInProgress.length })} />
      </Container>
      {widget.enableTaskList &&
        tasksData.slice(0, 5).map((task) => (
          <div
            key={task.id}
            className="text-theme-700 dark:text-theme-200 relative h-5 rounded-md bg-theme-200/50 dark:bg-theme-900/20 m-1 px-1 flex"
          >
            <div className="text-xs z-10 self-center ml-2 relative h-4 grow mr-2">
              <div className="absolute w-full h-4 whitespace-nowrap text-ellipsis overflow-hidden text-left">
                {task.title}
              </div>
            </div>
            {!task.dueDateIsDefault && (
              <div className="self-center text-xs flex justify-end mr-1.5 pl-1 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
                {t("common.relativeDate", {
                  value: task.dueDate,
                  formatParams: { value: { style: "narrow", numeric: "auto" } },
                })}
              </div>
            )}
          </div>
        ))}
    </>
  );
}
