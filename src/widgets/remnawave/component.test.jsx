// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/remnawave/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "remnawave" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("remnawave.onlineNow")).toBeInTheDocument();
    expect(screen.getByText("remnawave.nodesOnline")).toBeInTheDocument();
    expect(screen.getByText("remnawave.bandwidthToday")).toBeInTheDocument();
    expect(screen.getByText("remnawave.bandwidthSevenDays")).toBeInTheDocument();
  });

  it("renders error state", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "boom" } });

    const service = { widget: { type: "remnawave" } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getByText(/widget\.api_error\s+widget\.information/)).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it("renders stats and bandwidth data", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "stats") {
        return {
          data: {
            response: {
              onlineStats: { onlineNow: 42 },
              nodes: { totalOnline: 5 },
            },
          },
          error: undefined,
        };
      }

      if (endpoint === "stats/bandwidth") {
        return {
          data: {
            response: {
              bandwidthLastTwoDays: { current: "1073741824" },
              bandwidthLastSevenDays: { current: "10737418240" },
            },
          },
          error: undefined,
        };
      }

      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "remnawave" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "remnawave.onlineNow", 42);
    expectBlockValue(container, "remnawave.nodesOnline", 5);
    expectBlockValue(container, "remnawave.bandwidthToday", 1073741824);
    expectBlockValue(container, "remnawave.bandwidthSevenDays", 10737418240);
  });
});
