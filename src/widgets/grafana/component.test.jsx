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

describe("widgets/grafana/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading (stats missing)", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // stats
      .mockReturnValueOnce({ data: undefined, error: undefined }) // alerts
      .mockReturnValueOnce({ data: undefined, error: undefined }); // grafana

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "grafana", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("grafana.dashboards")).toBeInTheDocument();
    expect(screen.getByText("grafana.datasources")).toBeInTheDocument();
    expect(screen.getByText("grafana.totalalerts")).toBeInTheDocument();
    expect(screen.getByText("grafana.alertstriggered")).toBeInTheDocument();
  });

  it("computes triggered alerts for v1 from alert state=alerting", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { dashboards: 1, datasources: 2, alerts: 3 }, error: undefined }) // stats
      .mockReturnValueOnce(
        {
          data: [{ state: "ok" }, { state: "alerting" }, { state: "alerting" }],
          error: undefined,
        }, // alerts
      )
      .mockReturnValueOnce({ data: [{ id: 1 }], error: undefined }); // grafana (unused)

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "grafana", url: "http://x", version: 1 } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "grafana.dashboards", 1);
    expectBlockValue(container, "grafana.datasources", 2);
    expectBlockValue(container, "grafana.totalalerts", 3);
    expectBlockValue(container, "grafana.alertstriggered", 2);
  });

  it("falls back to the secondary endpoint for v1 when the primary alerts endpoint errors", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { dashboards: 0, datasources: 0, alerts: 0 }, error: undefined }) // stats
      .mockReturnValueOnce({ data: undefined, error: { message: "primary down" } }) // alerts
      .mockReturnValueOnce({ data: [{ id: 1 }, { id: 2 }, { id: 3 }], error: undefined }); // grafana

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "grafana", url: "http://x", version: 1 } }} />,
      { settings: { hideErrors: false } },
    );

    // Should not error if only the primary endpoint failed.
    expect(screen.queryAllByText(/widget\.api_error/i)).toHaveLength(0);
    expectBlockValue(container, "grafana.alertstriggered", 3);
  });

  it("uses the configured alerts endpoint for v2 and counts all returned alerts", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { dashboards: 9, datasources: 8, alerts: 7 }, error: undefined }) // stats
      .mockReturnValueOnce({ data: [{ id: 1 }, { id: 2 }], error: undefined }) // primary (custom)
      .mockReturnValueOnce({ data: undefined, error: undefined }); // secondary (disabled)

    const service = { widget: { type: "grafana", url: "http://x", version: 2, alerts: "custom" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(useWidgetAPI.mock.calls[1][1]).toBe("custom");
    expectBlockValue(container, "grafana.alertstriggered", 2);
  });
});
