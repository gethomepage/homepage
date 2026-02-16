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

describe("widgets/unifi/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders when default site isn't available yet", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "unifi" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("unifi.uptime")).toBeInTheDocument();
    expect(screen.getByText("unifi.wan")).toBeInTheDocument();
    expect(screen.getByText("unifi.lan_users")).toBeInTheDocument();
    expect(screen.getByText("unifi.wlan_users")).toBeInTheDocument();
    // 4 blocks if all are rendered.
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
  });

  it("renders a site-not-found error when widget.site doesn't match", () => {
    useWidgetAPI.mockReturnValue({
      data: { data: [{ name: "default", desc: "Default", health: [] }] },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "unifi", site: "Nope" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Site 'Nope' not found")).toBeInTheDocument();
  });

  it("renders uptime, wan and user counts when site data is present", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          {
            name: "default",
            desc: "Default",
            health: [
              { subsystem: "wan", status: "ok", num_user: 0, num_adopted: 0, "gw_system-stats": { uptime: 86400 } },
              { subsystem: "lan", status: "ok", num_user: 2, num_adopted: 5 },
              { subsystem: "wlan", status: "ok", num_user: 3, num_adopted: 6 },
            ],
          },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "unifi" } }} />, {
      settings: { hideErrors: false },
    });

    // uptime includes unifi.days suffix.
    expect(findServiceBlockByLabel(container, "unifi.uptime")?.textContent).toContain("unifi.days");
    expectBlockValue(container, "unifi.wan", "unifi.up");
    expectBlockValue(container, "unifi.lan_users", 2);
    expectBlockValue(container, "unifi.wlan_users", 3);
  });
});
