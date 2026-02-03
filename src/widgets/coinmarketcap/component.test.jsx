// @vitest-environment jsdom

import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

// HeadlessUI dropdown is hard to test reliably; stub to a simple button.
vi.mock("components/services/dropdown", () => ({
  default: ({ value, setValue }) => (
    <button type="button" data-testid="cmc-dropdown" onClick={() => setValue("24h")}>
      {value}
    </button>
  ),
}));

import Component from "./component";

describe("widgets/coinmarketcap/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a configure message when no symbols/slugs are provided", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "coinmarketcap" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("coinmarketcap.configure")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "coinmarketcap", symbols: ["BTC"] } }} />, {
      settings: { hideErrors: false },
    });

    // Error component normalizes the error into a message line we can assert on.
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders valid cryptos and updates percent change when date range changes", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: {
          BTC: {
            id: 1,
            name: "Bitcoin",
            quote: { USD: { price: 30000, percent_change_1h: 1.234, percent_change_24h: -2.5 } },
          },
          ETH: {
            id: 2,
            name: "Ethereum",
            quote: { USD: { price: 2000, percent_change_1h: null, percent_change_24h: null } },
          },
        },
      },
      error: undefined,
    });

    renderWithProviders(
      <Component
        service={{ widget: { type: "coinmarketcap", symbols: ["BTC", "ETH"], currency: "USD", defaultinterval: "1h" } }}
      />,
      { settings: { hideErrors: false } },
    );

    // Only BTC is valid for 1h, ETH is filtered out due to null percent change.
    expect(screen.getByTestId("cmc-dropdown")).toHaveTextContent("1h");
    expect(screen.getByText("Bitcoin")).toBeInTheDocument();
    expect(screen.queryByText("Ethereum")).toBeNull();
    expect(screen.getByText("30000")).toBeInTheDocument();
    expect(screen.getByText("1.23%")).toBeInTheDocument();

    fireEvent.click(screen.getByTestId("cmc-dropdown"));
    expect(screen.getByTestId("cmc-dropdown")).toHaveTextContent("24h");
    expect(screen.getByText("-2.50%")).toBeInTheDocument();
  });
});
