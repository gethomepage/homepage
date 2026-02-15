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

describe("widgets/prometheus/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "prometheus" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("prometheus.targets_up")).toBeInTheDocument();
    expect(screen.getByText("prometheus.targets_down")).toBeInTheDocument();
    expect(screen.getByText("prometheus.targets_total")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "prometheus" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders up/down/total counts from activeTargets", () => {
    useWidgetAPI.mockReturnValue({
      data: { data: { activeTargets: [{ health: "up" }, { health: "down" }, { health: "up" }] } },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "prometheus" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "prometheus.targets_up", 2);
    expectBlockValue(container, "prometheus.targets_down", 1);
    expectBlockValue(container, "prometheus.targets_total", 3);
  });
});
