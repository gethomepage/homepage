// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/dockhand/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields and filters to 4 blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "dockhand" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["running", "total", "cpu", "memory"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("dockhand.running")).toBeInTheDocument();
    expect(screen.getByText("dockhand.total")).toBeInTheDocument();
    expect(screen.getByText("dockhand.cpu")).toBeInTheDocument();
    expect(screen.getByText("dockhand.memory")).toBeInTheDocument();
  });

  it("renders environment-specific values when widget.environment matches", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        {
          id: "1",
          name: "Prod",
          containers: { running: 2, total: 5, paused: 1, pendingUpdates: 3 },
          metrics: { cpuPercent: 10, memoryPercent: 20 },
        },
      ],
      error: undefined,
    });

    const service = { widget: { type: "dockhand", environment: "prod" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "dockhand.running", 2);
    expectBlockValue(container, "dockhand.total", 5);
    expectBlockValue(container, "dockhand.cpu", 10);
    expectBlockValue(container, "dockhand.memory", 20);
  });
});
