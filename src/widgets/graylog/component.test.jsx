// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const service = {
  widget: { type: "graylog", url: "http://x" },
};

describe("widgets/graylog/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={service} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("graylog.messages")).toBeInTheDocument();
    expect(screen.getByText("graylog.throughput")).toBeInTheDocument();
    expect(screen.getByText("graylog.notifications")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(3);
  });

  it("renders error UI when any API call fails", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "connection refused" } });

    renderWithProviders(<Component service={service} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders message count, throughput and notification count", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "count") return { data: { total_results: 42 }, error: undefined };
      if (endpoint === "throughput")
        return {
          data: {
            metrics: [
              {
                full_name: "org.graylog2.throughput.input.1-sec-rate",
                metric: { type: "gauge", value: 7.6 },
              },
            ],
          },
          error: undefined,
        };
      if (endpoint === "notifications") return { data: { total: 3 }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={service} />, {
      settings: { hideErrors: false },
    });

    // Use small integers to avoid i18n locale-specific number formatting issues
    expectBlockValue(container, "graylog.messages", 42);
    expectBlockValue(container, "graylog.throughput", 8); // Math.round(7.6) = 8
    expectBlockValue(container, "graylog.notifications", 3);
  });

  it("uses widget.range when provided, defaulting to 86400", () => {
    const calls = [];
    useWidgetAPI.mockImplementation((_widget, endpoint, params) => {
      calls.push({ endpoint, params });
      return { data: undefined, error: undefined };
    });

    const serviceWithRange = { widget: { ...service.widget, range: 3600 } };
    renderWithProviders(<Component service={serviceWithRange} />, {
      settings: { hideErrors: false },
    });

    const countCall = calls.find((c) => c.endpoint === "count");
    expect(countCall.params.range).toBe(3600);
  });

  it("defaults range to 86400 when widget.range is not set", () => {
    const calls = [];
    useWidgetAPI.mockImplementation((_widget, endpoint, params) => {
      calls.push({ endpoint, params });
      return { data: undefined, error: undefined };
    });

    renderWithProviders(<Component service={service} />, {
      settings: { hideErrors: false },
    });

    const countCall = calls.find((c) => c.endpoint === "count");
    expect(countCall.params.range).toBe(86400);
  });
});
