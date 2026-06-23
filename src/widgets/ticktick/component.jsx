import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

const VALID_FIELDS = [
  "totalTasks",
  "openTasks",
  "completedTasks",
  "overdueTasks",
  "dueTodayTasks",
  "highPriorityTasks",
];
const DEFAULT_FIELDS = ["openTasks", "overdueTasks", "dueTodayTasks", "highPriorityTasks"];
const DEFAULT_FILTER = "open";

function priorityColor(priority) {
  if (priority >= 5) return "#ef4444";
  if (priority >= 3) return "#eab308";
  if (priority >= 1) return "#60a5fa";
  return "transparent";
}

function taskUrl(task, widget) {
  if (!widget.taskLink) return null;
  // desktop app doesn't support deep-linking by ID, search by title instead
  if (widget.taskLink === "app") return `ticktick://v1/search?keyword=${encodeURIComponent(task.title)}`;
  return `https://ticktick.com/webapp/#p/${widget.projectId}/tasks/${task.id}`;
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const taskFilter = widget.taskFilter ?? DEFAULT_FILTER;
  const configuredFields = widget.fields ? (Array.isArray(widget.fields) ? widget.fields : [widget.fields]) : null;
  const fields = configuredFields ? configuredFields.filter((field) => VALID_FIELDS.includes(field)) : DEFAULT_FIELDS;

  const needsClosed =
    taskFilter === "closed" ||
    taskFilter === "all" ||
    fields.includes("completedTasks") ||
    fields.includes("totalTasks");

  const { data: openData, error: openError } = useWidgetAPI(widget, "tasks");
  const { data: closedData, error: closedError } = useWidgetAPI(widget, needsClosed ? "closedTasks" : "");

  if (openError || (needsClosed && closedError)) {
    return <Container service={service} error={openError ?? closedError} />;
  }

  const closedReady = !needsClosed || closedData !== undefined;
  if (!openData || !closedReady) {
    return (
      <Container service={service}>
        {fields.map((field) => (
          <Block key={field} label={`ticktick.${field}`} />
        ))}
      </Container>
    );
  }

  const now = new Date();
  const endOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

  const openTasks = openData.filter((task) => !task.isCompleted);
  const closedTasks = closedData ?? [];

  const overdueTasks = openTasks.filter((task) => task.dueDate && new Date(task.dueDate) < now);
  const dueTodayTasks = openTasks.filter(
    (task) => task.dueDate && new Date(task.dueDate) >= now && new Date(task.dueDate) <= endOfToday,
  );
  const highPriorityTasks = openTasks.filter((task) => task.priority >= 5);

  const stats = {
    totalTasks: openTasks.length + closedTasks.length,
    openTasks: openTasks.length,
    completedTasks: closedTasks.length,
    overdueTasks: overdueTasks.length,
    dueTodayTasks: dueTodayTasks.length,
    highPriorityTasks: highPriorityTasks.length,
  };

  let taskList;
  if (taskFilter === "closed") {
    taskList = closedTasks;
  } else if (taskFilter === "all") {
    taskList = [...openTasks, ...closedTasks];
  } else {
    taskList = openTasks;
  }
  if (widget.taskFetchLimit > 0) taskList = taskList.slice(0, widget.taskFetchLimit);

  return (
    <>
      <Container service={service}>
        {fields.map((field) => (
          <Block key={field} label={`ticktick.${field}`} value={t("common.number", { value: stats[field] })} />
        ))}
      </Container>

      {widget.taskListEnabled && taskList.length > 0 && (
        <div
          className="mx-1 mt-1 mb-1"
          style={widget.taskListHeight ? { maxHeight: widget.taskListHeight, overflowY: "auto" } : undefined}
        >
          {taskList.map((task) => {
            const url = taskUrl(task, widget);
            const taskContent = (
              <>
                <div
                  style={
                    task.priority > 0 && !task.isCompleted ? { borderColor: priorityColor(task.priority) } : undefined
                  }
                  className={`flex-shrink-0 w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center ${
                    task.isCompleted ? "bg-theme-500 border-theme-500" : "border-theme-400"
                  }`}
                >
                  {task.isCompleted && (
                    <svg
                      viewBox="0 0 10 8"
                      className="w-2 h-2"
                      fill="none"
                      stroke="white"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="1,4 4,7 9,1" />
                    </svg>
                  )}
                </div>
                <div
                  className={`flex-1 text-xs truncate min-w-0 ${
                    task.isCompleted
                      ? "line-through text-theme-500 dark:text-theme-500"
                      : "text-theme-700 dark:text-theme-200"
                  }`}
                >
                  {task.title}
                </div>
                {task.dueDate && (
                  <div
                    className={`flex-shrink-0 text-xs px-1.5 py-0.5 rounded ${
                      !task.isCompleted && new Date(task.dueDate) < now
                        ? "bg-red-500/20 text-red-400"
                        : !task.isCompleted && new Date(task.dueDate) <= endOfToday
                          ? "bg-yellow-500/20 text-yellow-400"
                          : "bg-theme-300/30 dark:bg-theme-800/30 text-theme-500 dark:text-theme-400"
                    }`}
                  >
                    {t("common.relativeDate", {
                      value: task.dueDate,
                      formatParams: { value: { style: "narrow", numeric: "auto" } },
                    })}
                  </div>
                )}
              </>
            );

            const rowClass =
              "flex items-center gap-2 px-2 py-1.5 mb-0.5 rounded-sm border-l-2 bg-theme-200/30 dark:bg-theme-900/30 hover:bg-theme-200/50 dark:hover:bg-theme-900/50 transition-colors";
            const rowStyle = { borderLeftColor: priorityColor(task.priority) };

            return url ? (
              <a
                key={task.id}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                style={rowStyle}
                className={`${rowClass} cursor-pointer`}
              >
                {taskContent}
              </a>
            ) : (
              <div key={task.id} style={rowStyle} className={rowClass}>
                {taskContent}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
