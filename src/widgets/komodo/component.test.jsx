// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/komodo/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields for stacks view and skips containers endpoint when showStacks=true and showSummary=false", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // containers (disabled)
      .mockReturnValueOnce({ data: undefined, error: undefined }) // stacks
      .mockReturnValueOnce({ data: undefined, error: undefined }); // servers (disabled)

    const service = { widget: { type: "komodo", showStacks: true, showSummary: false } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["total", "running", "down", "unhealthy"]);
    expect(useWidgetAPI.mock.calls[0][1]).toBe(""); // containersEndpoint
    expect(useWidgetAPI.mock.calls[1][1]).toBe("stacks");
    expect(useWidgetAPI.mock.calls[2][1]).toBe(""); // serversEndpoint

    // Default fields filter out "unknown" which is rendered but not in widget.fields.
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("komodo.total")).toBeInTheDocument();
    expect(screen.getByText("komodo.running")).toBeInTheDocument();
    expect(screen.getByText("komodo.down")).toBeInTheDocument();
    expect(screen.getByText("komodo.unhealthy")).toBeInTheDocument();
    expect(screen.queryByText("komodo.unknown")).toBeNull();
  });

  it("renders computed down=stopped+down for stacks view", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // containers (disabled)
      .mockReturnValueOnce({
        data: { total: 10, running: 7, stopped: 1, down: 2, unhealthy: 3, unknown: 4 },
        error: undefined,
      })
      .mockReturnValueOnce({ data: undefined, error: undefined }); // servers (disabled)

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "komodo", showStacks: true, showSummary: false } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
    const downBlock = findServiceBlockByLabel(container, "komodo.down");
    expect(downBlock).toBeTruthy();
    expect(downBlock.textContent).toContain("3"); // stopped(1) + down(2)
  });

  it("renders summary view ratios when showSummary=true", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { total: 5, running: 4 }, error: undefined }) // containers
      .mockReturnValueOnce({ data: { total: 2, running: 1 }, error: undefined }) // stacks
      .mockReturnValueOnce({ data: { total: 1, healthy: 1 }, error: undefined }); // servers

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "komodo", showSummary: true } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("1 / 1")).toBeInTheDocument();
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("4 / 5")).toBeInTheDocument();
  });
});
