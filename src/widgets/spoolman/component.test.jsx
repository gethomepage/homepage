// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/spoolman/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders guessed loading blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "spoolman", spoolIds: [1, 2] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getAllByText("spoolman.loading")).toHaveLength(2);
  });

  it("renders no-spools message when API returns an empty list", () => {
    useWidgetAPI.mockReturnValue({ data: [], error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "spoolman" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("spoolman.noSpools")).toBeInTheDocument();
  });

  it("filters to selected spoolIds and caps at 4 entries", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        { id: 1, remaining_weight: 50, initial_weight: 100, filament: { name: "A" } },
        { id: 2, remaining_weight: 25, initial_weight: 100, filament: { name: "B" } },
        { id: 3, remaining_weight: 10, initial_weight: 100, filament: { name: "C" } },
        { id: 4, remaining_weight: 10, initial_weight: 100, filament: { name: "D" } },
        { id: 5, remaining_weight: 10, initial_weight: 100, filament: { name: "E" } },
      ],
      error: undefined,
    });

    const service = { widget: { type: "spoolman", spoolIds: [2, 3, 4, 5, 1] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // After filtering and capping to 4, we should see 4 blocks.
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "A", 50);
    expectBlockValue(container, "B", 25);
  });
});
