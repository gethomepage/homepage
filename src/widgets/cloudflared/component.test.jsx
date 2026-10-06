// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue, findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/cloudflared/component", () => {
  beforeEach(() => vi.resetAllMocks());

  function mockResponses(stats, connections) {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "cfd_tunnel") return stats;
      if (endpoint === "connections") return connections;
      throw new Error(`Unexpected endpoint: ${endpoint}`);
    });
  }

  function renderWidget() {
    return renderWithProviders(<Component service={{ widget: { type: "cloudflared" } }} />, {
      settings: { hideErrors: false },
    });
  }

  it("renders placeholders while both requests are loading", () => {
    mockResponses({ data: undefined }, { data: undefined });
    const { container } = renderWidget();
    expect(container.querySelectorAll(".service-block.animate-pulse")).toHaveLength(2);
    expect(screen.getByText("cloudflared.status")).toBeInTheDocument();
    expect(screen.getByText("cloudflared.origin_ip")).toBeInTheDocument();
  });

  it("renders status without the retired connections field and reads connector IPs", () => {
    mockResponses(
      { data: { result: { status: "healthy" } } },
      { data: { result: [{ conns: [{ origin_ip: "1.2.3.4" }] }] } },
    );
    const { container } = renderWidget();
    expectBlockValue(container, "cloudflared.status", "Healthy");
    expectBlockValue(container, "cloudflared.origin_ip", "1.2.3.4");
  });

  it("finds the first available IP across connectors and connections", () => {
    mockResponses(
      { data: { result: { status: "degraded", connections: [{ origin_ip: "old-ip" }] } } },
      { data: { result: [{}, { conns: [] }, { conns: [{}, { origin_ip: "5.6.7.8" }, { origin_ip: "9.10.11.12" }] }] } },
    );
    const { container } = renderWidget();
    expectBlockValue(container, "cloudflared.status", "Degraded");
    expectBlockValue(container, "cloudflared.origin_ip", "5.6.7.8");
    expect(container.textContent).not.toContain("old-ip");
  });

  it.each([
    { connectors: [] },
    { connectors: [{}] },
    { connectors: [{ conns: [] }] },
    { connectors: [{ conns: [{}] }] },
  ])("renders a settled placeholder when no connector has an IP ($connectors)", ({ connectors }) => {
    mockResponses({ data: { result: { status: "down" } } }, { data: { result: connectors } });
    const { container } = renderWidget();
    expectBlockValue(container, "cloudflared.status", "Down");
    expectBlockValue(container, "cloudflared.origin_ip", "-");
    expect(findServiceBlockByLabel(container, "cloudflared.origin_ip")).not.toHaveClass("animate-pulse");
  });

  it("renders status while connector details are loading", () => {
    mockResponses({ data: { result: { status: "healthy" } } }, { data: undefined });
    const { container } = renderWidget();
    expectBlockValue(container, "cloudflared.status", "Healthy");
    expect(findServiceBlockByLabel(container, "cloudflared.origin_ip")).toHaveClass("animate-pulse");
  });

  it("keeps placeholders when connectors load before tunnel status", () => {
    mockResponses({ data: undefined }, { data: { result: [{ conns: [{ origin_ip: "1.2.3.4" }] }] } });
    const { container } = renderWidget();
    expect(container.querySelectorAll(".service-block.animate-pulse")).toHaveLength(2);
  });

  it.each(["cfd_tunnel", "connections"])("shows errors from the %s request", (failedEndpoint) => {
    useWidgetAPI.mockImplementation((_widget, endpoint) =>
      endpoint === failedEndpoint
        ? { error: { message: "Cloudflare request failed" } }
        : { data: endpoint === "cfd_tunnel" ? { result: { status: "healthy" } } : { result: [] } },
    );
    const { container } = renderWidget();
    expect(container.querySelectorAll(".service-block")).toHaveLength(0);
    expect(screen.getByText(/Cloudflare request failed/)).toBeInTheDocument();
  });
});
