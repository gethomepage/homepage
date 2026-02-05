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

describe("widgets/ghostfolio/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading (no net worth by default)", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // today
      .mockReturnValueOnce({ data: undefined, error: undefined }) // year
      .mockReturnValueOnce({ data: undefined, error: undefined }) // max
      .mockReturnValueOnce({ data: undefined, error: undefined }); // userInfo (disabled)

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "ghostfolio", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("ghostfolio.gross_percent_today")).toBeInTheDocument();
    expect(screen.getByText("ghostfolio.gross_percent_1y")).toBeInTheDocument();
    expect(screen.getByText("ghostfolio.gross_percent_max")).toBeInTheDocument();
    expect(screen.queryByText("ghostfolio.net_worth")).toBeNull();
  });

  it("renders error UI when the today endpoint returns 401", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { statusCode: 401, message: "Unauthorized" }, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "ghostfolio", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });

  it("renders performance percent ranges and net worth when enabled", () => {
    useWidgetAPI
      .mockReturnValueOnce({
        data: { performance: { netPerformancePercentageWithCurrencyEffect: 0.1, currentNetWorth: 123.456 } },
        error: undefined,
      })
      .mockReturnValueOnce({
        data: { performance: { grossPerformancePercentage: -0.05 } },
        error: undefined,
      })
      .mockReturnValueOnce({
        data: { performance: { currentGrossPerformancePercent: 0 } },
        error: undefined,
      })
      .mockReturnValueOnce({ data: { settings: { currency: "USD" } }, error: undefined });

    const { container } = renderWithProviders(
      <Component
        service={{
          widget: {
            type: "ghostfolio",
            url: "http://x",
            fields: ["gross_percent_today", "gross_percent_1y", "gross_percent_max", "net_worth"],
          },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "ghostfolio.gross_percent_today", "+10");
    expectBlockValue(container, "ghostfolio.gross_percent_1y", "-5");
    expectBlockValue(container, "ghostfolio.gross_percent_max", "0");
    expectBlockValue(container, "ghostfolio.net_worth", "123.46 USD");
  });
});
