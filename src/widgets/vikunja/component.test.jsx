// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/vikunja/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "vikunja" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("vikunja.projects")).toBeInTheDocument();
    expect(screen.getByText("vikunja.tasks7d")).toBeInTheDocument();
    expect(screen.getByText("vikunja.tasksOverdue")).toBeInTheDocument();
    expect(screen.getByText("vikunja.tasksInProgress")).toBeInTheDocument();
  });

  it("computes project/task stats when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "projects") return { data: [{ id: 1 }, { id: -1 }], error: undefined };
      if (endpoint === "tasks") {
        return {
          data: [
            { dueDateIsDefault: false, dueDate: "2020-01-02T00:00:00Z", inProgress: true },
            { dueDateIsDefault: false, dueDate: "2019-12-31T00:00:00Z", inProgress: false },
            { dueDateIsDefault: true, dueDate: "2099-01-01T00:00:00Z", inProgress: false },
          ],
          error: undefined,
        };
      }
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "vikunja" } }} />, {
      settings: { hideErrors: false },
    });

    // projects filters id > 0 => 1
    expectBlockValue(container, "vikunja.projects", 1);
    // tasks7d includes both non-default dueDate tasks (both <= one week)
    expectBlockValue(container, "vikunja.tasks7d", 2);
    // overdue includes dueDate <= now => 1 (2019-12-31)
    expectBlockValue(container, "vikunja.tasksOverdue", 1);
    // inProgress => 1
    expectBlockValue(container, "vikunja.tasksInProgress", 1);
  });
});
