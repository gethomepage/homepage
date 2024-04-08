import { useEffect, useState } from "react";
import { useTranslation } from "next-i18next";
import { DateTime } from "luxon";

import useWidgetAPI from "../../../utils/proxy/use-widget-api";
import Error from "../../../components/services/widget/error";
import Agenda from "../agenda";


export default function Project({ widget }) {
  const { t } = useTranslation();

  // Fetch projects data unconditionally
  const { data: projectsData, error: projectsError } = useWidgetAPI(widget, "getAllProjects");

  // Fetch tasks for the specific project unconditionally
  const { data: tasksData, error: tasksError } = useWidgetAPI(widget, "getAllActiveTasks", {
    refreshInterval: widget.refreshInterval || 300000, // 5 minutes, use default if not provided
  });

  // State to hold tasks
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    // Check for errors
    if (projectsError) {
      return;
    }

    // Check if projectsData is available
    if (!projectsData) {
      return;
    }

    // Find the project with the given name
    const project = projectsData.find((index) => index.name === widget.project_name);

    // Check if project exists
    if (!project) {
      return;
    }

    // Extract project ID and color
    const projectId = project.id;
    const projectColor = widget.color || project.color || "blue"; // Default color if not provided

    // Check for tasks error
    if (tasksError) {
      return;
    }

    // Process tasks data and set tasks
    if (tasksData && tasksData.length > 0) {
      const tasksToAdd = tasksData
        .filter((task) => task.project_id === projectId) // Filter tasks by project ID
        .slice(0, widget.maxTasks || tasksData.length)
        .map((task) => ({
          title: task.content || t("Untitled Task by Label"),
          date: task.due ? DateTime.fromISO(task.due.date, { zone: widget.timeZone }).toJSDate() : null,
          color: projectColor, // Assign project color to task
          description: task.tags ? task.tags.join(", ") : "",
          url: task.url,
          id: task.id,
        }));

      // Update the tasks state
      setTasks(tasksToAdd);
    }
  }, [projectsData, projectsError, tasksData, tasksError, widget, t]);

  // Check for tasks error and display error component if not hidden
  if (tasksError && !widget.hideErrors) {
    return <Error error={{ message: `${widget.type}: ${tasksError.message}` }} />;
  }

  // Check for projects error and display error component
  if (projectsError) {
    return <Error error={{ message: `${widget.type}: ${projectsError.message}` }} />;
  }

  // If projectsData is not yet available, return null or loading indicator
  if (!projectsData) {
    return null; // or return a loading indicator
  }

  // Find the project with the given name
  const project = projectsData.find((index) => index.name === widget.project_name);

  // If project does not exist, display error component
  if (!project) {
    return <Error error={{ message: `${widget.type}: Project not found` }} />;
  }

  // Render the Agenda component with tasks
  return <Agenda tasks={tasks} />;
}
