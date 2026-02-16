// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/peanut/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "peanut" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("peanut.battery_charge")).toBeInTheDocument();
    expect(screen.getByText("peanut.ups_load")).toBeInTheDocument();
    expect(screen.getByText("peanut.ups_status")).toBeInTheDocument();
  });

  it("renders legacy field mapping and status translation", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        "battery.charge": 55,
        "ups.load": 12,
        "ups.status": "OL",
      },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "peanut" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("55")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("peanut.online")).toBeInTheDocument();
  });
});
