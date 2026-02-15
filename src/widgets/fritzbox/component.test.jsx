// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component, { fritzboxDefaultFields } from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/fritzbox/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields and filters to 4 blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "fritzbox", url: "http://x" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(fritzboxDefaultFields);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("fritzbox.connectionStatus")).toBeInTheDocument();
    expect(screen.getByText("fritzbox.uptime")).toBeInTheDocument();
    expect(screen.getByText("fritzbox.maxDown")).toBeInTheDocument();
    expect(screen.getByText("fritzbox.maxUp")).toBeInTheDocument();
    expect(screen.queryByText("fritzbox.externalIPAddress")).toBeNull();
  });

  it("caps widget.fields at 4 entries", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = {
      widget: {
        type: "fritzbox",
        fields: ["down", "up", "received", "sent", "externalIPAddress", "externalIPv6Prefix"],
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["down", "up", "received", "sent"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("fritzbox.down")).toBeInTheDocument();
    expect(screen.getByText("fritzbox.up")).toBeInTheDocument();
    expect(screen.getByText("fritzbox.received")).toBeInTheDocument();
    expect(screen.getByText("fritzbox.sent")).toBeInTheDocument();
    expect(screen.queryByText("fritzbox.externalIPAddress")).toBeNull();
  });

  it("renders computed values when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        connectionStatus: 1,
        uptime: 100,
        maxDown: 8000,
        maxUp: 16000,
        down: 80,
        up: 40,
        received: 1024,
        sent: 2048,
        externalIPAddress: "1.2.3.4",
        externalIPv6Address: "::1",
        externalIPv6Prefix: "abcd::/64",
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "fritzbox", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "fritzbox.connectionStatus", "fritzbox.connectionStatus1");
    expectBlockValue(container, "fritzbox.uptime", 100);
    expectBlockValue(container, "fritzbox.maxDown", 1000); // 8000/8
    expectBlockValue(container, "fritzbox.maxUp", 2000); // 16000/8
  });
});
