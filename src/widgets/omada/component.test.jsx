// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingsContext } from "utils/contexts/settings";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => {
      if (key === "common.number") return String(opts?.value ?? "");
      return key;
    },
  }),
}));

vi.mock("../../utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

function renderWithSettings(ui) {
  return render(
    <SettingsContext.Provider value={{ settings: {}, setSettings: () => {} }}>{ui}</SettingsContext.Provider>,
  );
}

describe("widgets/omada/component", () => {
  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithSettings(<Component service={{ widget: { type: "omada", url: "http://x" } }} />);

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders placeholders while loading and defaults fields to 4 visible blocks", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithSettings(<Component service={{ widget: { type: "omada", url: "http://x" } }} />);

    // Default fields do not include connectedSwitches, so Container filters it out.
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("omada.connectedAp")).toBeInTheDocument();
    expect(screen.getByText("omada.activeUser")).toBeInTheDocument();
    expect(screen.getByText("omada.alerts")).toBeInTheDocument();
    expect(screen.getByText("omada.connectedGateways")).toBeInTheDocument();
    expect(screen.queryByText("omada.connectedSwitches")).toBeNull();

    // Values should be placeholders ("-") while loading.
    expect(screen.getAllByText("-")).toHaveLength(4);
  });

  it("renders values when loaded (formatted via common.number)", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        connectedAp: 1,
        activeUser: 2,
        alerts: 3,
        connectedGateways: 4,
        connectedSwitches: 5,
      },
      error: undefined,
    });

    const { container } = renderWithSettings(<Component service={{ widget: { type: "omada", url: "http://x" } }} />);

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.queryByText("5")).toBeNull(); // connectedSwitches filtered by default fields
  });
});
