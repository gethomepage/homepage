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

describe("widgets/firefly/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "firefly" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("firefly.networth")).toBeInTheDocument();
    expect(screen.getByText("firefly.budget")).toBeInTheDocument();
  });

  it("renders error UI when either request errors", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: { message: "nope" } }) // summary
      .mockReturnValueOnce({ data: undefined, error: undefined }); // budgets

    renderWithProviders(<Component service={{ widget: { type: "firefly" } }} />, { settings: { hideErrors: false } });

    // The widget uses a string error, which Error normalizes to { message }.
    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Failed to load Firefly account summary and budgets")).toBeInTheDocument();
  });

  it("renders net worth and budget summary", () => {
    useWidgetAPI
      .mockReturnValueOnce({
        data: { "net-worth-in-EUR": { value_parsed: "100" } },
        error: undefined,
      })
      .mockReturnValueOnce({
        data: {
          data: [
            {
              type: "available_budgets",
              attributes: {
                amount: "100",
                currency_symbol: "$",
                spent_in_budgets: [{ sum: "-10" }],
              },
            },
          ],
        },
        error: undefined,
      });

    renderWithProviders(<Component service={{ widget: { type: "firefly" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("$ 10 / $ 100")).toBeInTheDocument();
  });
});
