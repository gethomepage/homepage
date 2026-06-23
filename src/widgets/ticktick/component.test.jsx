// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const PROJECT = { id: "proj1", name: "WB" };

const TASKS = [
  { id: "t1", title: "Task overdue", priority: 0, dueDate: "2020-01-01T00:00:00Z", isCompleted: false },
  { id: "t2", title: "Task today", priority: 5, dueDate: "2020-01-15T12:00:00Z", isCompleted: false },
  { id: "t3", title: "Task future", priority: 0, dueDate: "2020-02-01T00:00:00Z", isCompleted: false },
  { id: "t4", title: "Task done", priority: 0, dueDate: null, isCompleted: true },
];

describe("widgets/ticktick/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-15T06:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "ticktick", projectId: "proj1" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("ticktick.openTasks")).toBeInTheDocument();
    expect(screen.getByText("ticktick.overdueTasks")).toBeInTheDocument();
    expect(screen.getByText("ticktick.dueTodayTasks")).toBeInTheDocument();
    expect(screen.getByText("ticktick.highPriorityTasks")).toBeInTheDocument();
  });

  it("computes task stats when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "project") return { data: PROJECT, error: undefined };
      if (endpoint === "tasks") return { data: TASKS, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "ticktick", projectId: "proj1" } }} />,
      { settings: { hideErrors: false } },
    );

    // 3 open tasks (t4 is completed)
    expectBlockValue(container, "ticktick.openTasks", 3);
    // 1 overdue (t1, dueDate in 2020-01-01 < now 2020-01-15T06:00)
    expectBlockValue(container, "ticktick.overdueTasks", 1);
    // 1 due today (t2, dueDate 2020-01-15T12:00 > now but before end of day)
    expectBlockValue(container, "ticktick.dueTodayTasks", 1);
    // 1 high priority (t2, priority=5 >= 5)
    expectBlockValue(container, "ticktick.highPriorityTasks", 1);
  });

  it("renders task list when taskListEnabled is true", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "project") return { data: PROJECT, error: undefined };
      if (endpoint === "tasks") return { data: TASKS, error: undefined };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(
      <Component
        service={{ widget: { type: "ticktick", projectId: "proj1", taskListEnabled: true, taskFetchLimit: 10 } }}
      />,
      { settings: { hideErrors: false } },
    );

    // only open tasks shown by default (taskFilter: open)
    expect(screen.getByText("Task overdue")).toBeInTheDocument();
    expect(screen.getByText("Task today")).toBeInTheDocument();
    expect(screen.getByText("Task future")).toBeInTheDocument();
    expect(screen.queryByText("Task done")).not.toBeInTheDocument();
  });

  it("limits task list to taskFetchLimit", () => {
    const manyTasks = Array.from({ length: 10 }, (_, i) => ({
      id: `t${i}`,
      title: `Task ${i}`,
      priority: 0,
      dueDate: null,
      isCompleted: false,
    }));

    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "project") return { data: PROJECT, error: undefined };
      if (endpoint === "tasks") return { data: manyTasks, error: undefined };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(
      <Component
        service={{ widget: { type: "ticktick", projectId: "proj1", taskListEnabled: true, taskFetchLimit: 3 } }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("Task 0")).toBeInTheDocument();
    expect(screen.getByText("Task 2")).toBeInTheDocument();
    expect(screen.queryByText("Task 3")).not.toBeInTheDocument();
  });
});
