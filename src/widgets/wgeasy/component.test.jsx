// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

describe("widgets/wgeasy/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sets default fields and renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "wgeasy" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["connected", "enabled", "total"]);
    // Container filters by widget.fields; "disabled" is not included by default.
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("wgeasy.connected")).toBeInTheDocument();
    expect(screen.getByText("wgeasy.enabled")).toBeInTheDocument();
    expect(screen.queryByText("wgeasy.disabled")).toBeNull();
    expect(screen.getByText("wgeasy.total")).toBeInTheDocument();
  });

  it("computes enabled/disabled/connected counts when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        { enabled: true, latestHandshakeAt: "2020-01-01T00:00:00Z" },
        { enabled: true, latestHandshakeAt: "2019-12-31T23:00:00Z" },
        { enabled: false, latestHandshakeAt: "2019-12-30T00:00:00Z" },
      ],
      error: undefined,
    });

    const service = { widget: { type: "wgeasy", threshold: 2 } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // enabled=2, disabled=1; connected uses threshold minutes (2min) so only the first handshake counts.
    expectBlockValue(container, "wgeasy.enabled", 2);
    expectBlockValue(container, "wgeasy.connected", 1);
    expectBlockValue(container, "wgeasy.total", 3);
  });
});
