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

describe("widgets/tailscale/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tailscale" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("tailscale.address")).toBeInTheDocument();
    expect(screen.getByText("tailscale.last_seen")).toBeInTheDocument();
    expect(screen.getByText("tailscale.expires")).toBeInTheDocument();
  });

  it("renders address and expiry/last-seen strings when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        addresses: ["100.64.0.1"],
        keyExpiryDisabled: true,
        lastSeen: "2019-12-31T23:00:00Z",
        expires: "2021-01-01T00:00:00Z",
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tailscale" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "tailscale.address", "100.64.0.1");
    expect(findServiceBlockByLabel(container, "tailscale.last_seen")?.textContent).toContain("tailscale.ago");
    expectBlockValue(container, "tailscale.expires", "tailscale.never");
  });
});
