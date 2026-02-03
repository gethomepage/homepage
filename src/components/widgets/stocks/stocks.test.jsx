// @vitest-environment jsdom

import { fireEvent, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

import Stocks from "./stocks";

describe("components/widgets/stocks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders a loading state while waiting for data", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Stocks options={{}} />, { settings: { target: "_self" } });

    expect(screen.getByText(/stocks\.loading/)).toBeInTheDocument();
  });

  it("toggles between price and percent change on click", () => {
    useSWR.mockReturnValue({
      data: {
        stocks: [
          { ticker: "NASDAQ:AAPL", currentPrice: 123.45, percentChange: 1.23 },
          { ticker: "MSFT", currentPrice: 99.99, percentChange: -0.5 },
        ],
      },
      error: undefined,
    });

    renderWithProviders(<Stocks options={{ color: false }} />, { settings: { target: "_self" } });

    expect(screen.getByText("AAPL")).toBeInTheDocument();
    expect(screen.getByText("123.45")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button"));
    expect(screen.getByText("1.23%")).toBeInTheDocument();
    expect(screen.getByText("-0.5%")).toBeInTheDocument();
  });
});
