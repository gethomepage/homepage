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

describe("widgets/prometheusmetric/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders blocks for configured metrics even when data is not yet available", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = {
      widget: {
        type: "prometheusmetric",
        metrics: [
          { label: "prometheusmetric.metricA", query: "metric_a" },
          { label: "prometheusmetric.metricB", query: "metric_b" },
        ],
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // Component renders one Block per metric; with no widget.fields, Container does not filter.
    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("prometheusmetric.metricA")).toBeInTheDocument();
    expect(screen.getByText("prometheusmetric.metricB")).toBeInTheDocument();
  });

  it("formats scalar and vector query results (scale + prefix + suffix)", () => {
    useWidgetAPI.mockImplementation((_widget, _endpoint, params) => {
      if (params?.query === "scalar_q") {
        return {
          data: { data: { resultType: "scalar", result: [0, "5"] } },
          error: undefined,
        };
      }

      if (params?.query === "vector_q") {
        return {
          data: { data: { resultType: "vector", result: [{ value: [0, "3"] }] } },
          error: undefined,
        };
      }

      return { data: undefined, error: undefined };
    });

    const service = {
      widget: {
        type: "prometheusmetric",
        metrics: [
          {
            label: "prometheusmetric.scalar",
            query: "scalar_q",
            format: { type: "number", scale: 2, prefix: "~", suffix: "x" },
          },
          {
            label: "prometheusmetric.vector",
            query: "vector_q",
            format: { type: "number", scale: "1/2" },
          },
        ],
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // scalar "5" * 2 => 10 => "~10x"
    expectBlockValue(container, "prometheusmetric.scalar", "~10x");
    // vector "3" * (1/2) => 1.5
    expectBlockValue(container, "prometheusmetric.vector", 1.5);
  });

  it("renders error UI when any query errors", () => {
    useWidgetAPI.mockImplementation((_widget, _endpoint, params) => {
      if (params?.query === "bad") return { data: undefined, error: { message: "nope" } };
      return { data: { data: { resultType: "scalar", result: [0, "1"] } }, error: undefined };
    });

    renderWithProviders(
      <Component
        service={{
          widget: {
            type: "prometheusmetric",
            metrics: [
              { label: "prometheusmetric.ok", query: "ok" },
              { label: "prometheusmetric.bad", query: "bad" },
            ],
          },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });
});
