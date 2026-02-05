// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/apcups/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "apcups" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("apcups.status")).toBeInTheDocument();
    expect(screen.getByText("apcups.load")).toBeInTheDocument();
    expect(screen.getByText("apcups.bcharge")).toBeInTheDocument();
    expect(screen.getByText("apcups.timeleft")).toBeInTheDocument();
  });

  it("renders values when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { status: "ONLINE", load: "12", bcharge: "99", timeleft: "30" },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "apcups" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("ONLINE")).toBeInTheDocument();
    expect(screen.getByText("12")).toBeInTheDocument();
    expect(screen.getByText("99")).toBeInTheDocument();
    expect(screen.getByText("30")).toBeInTheDocument();
  });
});
