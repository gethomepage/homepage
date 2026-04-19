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

  it("renders Adanos sentiment rows when sentiment is enabled", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "sentiment") {
        return {
          data: {
            stocks: [
              {
                ticker: "AAPL",
                sentiment_score: 0.42,
                buzz_score: 73,
              },
            ],
          },
          error: undefined,
        };
      }
      return { data: undefined, error: undefined };
    });

    renderWithProviders(
      <Component
        service={{
          widget: {
            type: "stocks",
            watchlist: ["AAPL"],
            showSentiment: true,
            sentimentDays: 14,
            sentimentSource: "news_stocks",
          },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(useWidgetAPI).toHaveBeenCalledWith(expect.objectContaining({ showSentiment: true }), "sentiment", {
      tickers: "AAPL",
      days: 14,
    });
    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("0.42")).toBeInTheDocument();
    expect(screen.getByText("/73")).toBeInTheDocument();
  });

  it("rejects Adanos sentiment watchlists above the compare endpoint limit", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(
      <Component
        service={{
          widget: {
            type: "stocks",
            watchlist: ["AAPL", "MSFT", "NVDA", "TSLA", "AMZN", "META", "GOOGL", "AVGO", "AMD", "NFLX", "PLTR"],
            showSentiment: true,
          },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("stocks.invalidConfiguration")).toBeInTheDocument();
    expect(useWidgetAPI).toHaveBeenCalledWith(
      expect.objectContaining({ showSentiment: true }),
      "",
      expect.objectContaining({ tickers: expect.any(String) }),
    );
  });
});
