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

describe("widgets/netalertx/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "netalertx" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("netalertx.total")).toBeInTheDocument();
    expect(screen.getByText("netalertx.connected")).toBeInTheDocument();
    expect(screen.getByText("netalertx.new_devices")).toBeInTheDocument();
    expect(screen.getByText("netalertx.down_alerts")).toBeInTheDocument();
  });

  it("uses datav2 endpoint for version > 1 and renders parsed totals", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "datav2") return { data: ["10", "5", "0", "2", "1"], error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "netalertx", version: 2 } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenCalled();
    expectBlockValue(container, "netalertx.total", 10);
    expectBlockValue(container, "netalertx.connected", 5);
    expectBlockValue(container, "netalertx.new_devices", 2);
    expectBlockValue(container, "netalertx.down_alerts", 1);
  });
});
