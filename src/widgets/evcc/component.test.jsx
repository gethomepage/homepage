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

describe("widgets/evcc/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "evcc", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("evcc.pv_power")).toBeInTheDocument();
    expect(screen.getByText("evcc.grid_power")).toBeInTheDocument();
    expect(screen.getByText("evcc.home_power")).toBeInTheDocument();
    expect(screen.getByText("evcc.charge_power")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(4);
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "evcc", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders computed kilowatt values (including result wrapper, grid fallback, and loadpoint sum)", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        result: {
          pvPower: 1000,
          grid: { power: 2000 },
          homePower: 3000,
          loadpoints: [{ chargePower: 500 }, { chargePower: 1500 }],
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "evcc", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "evcc.pv_power", "1 evcc.kilowatt");
    expectBlockValue(container, "evcc.grid_power", "2 evcc.kilowatt");
    expectBlockValue(container, "evcc.home_power", "3 evcc.kilowatt");
    expectBlockValue(container, "evcc.charge_power", "2 evcc.kilowatt");
  });
});
