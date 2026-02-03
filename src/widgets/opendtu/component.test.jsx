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

describe("widgets/opendtu/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "opendtu" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("opendtu.yieldDay")).toBeInTheDocument();
    expect(screen.getByText("opendtu.relativePower")).toBeInTheDocument();
    expect(screen.getByText("opendtu.absolutePower")).toBeInTheDocument();
    expect(screen.getByText("opendtu.limit")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "opendtu" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders totals and computed relative power", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        total: {
          YieldDay: { v: 12.4, u: "kWh" },
          Power: { v: 250, u: "W" },
        },
        inverters: [{ limit_absolute: 200 }, { limit_absolute: 300 }],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "opendtu" } }} />, {
      settings: { hideErrors: false },
    });

    // yieldDay is rounded and has unit appended.
    expectBlockValue(container, "opendtu.yieldDay", "12kWh");
    // relative power is percent of power / totalLimit (250/500*100 = 50)
    expectBlockValue(container, "opendtu.relativePower", "50");
    expectBlockValue(container, "opendtu.absolutePower", "250W");
    expectBlockValue(container, "opendtu.limit", "500W");
  });
});
