// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/stocks/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders invalid configuration message when watchlist is empty", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "stocks", watchlist: [] } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("stocks.invalidConfiguration")).toBeInTheDocument();
  });

  it("renders stock items for a valid watchlist", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "quote") return { data: { dp: 1.23, c: 100 }, error: undefined };
      if (endpoint === "status") return { data: { isOpen: true }, error: undefined };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(
      <Component service={{ widget: { type: "stocks", watchlist: ["AAPL"], showUSMarketStatus: true } }} />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("1.23%")).toBeInTheDocument();
  });
});
