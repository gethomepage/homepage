// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function proxiesPayload(overrides = {}) {
  return {
    data: {
      proxies: {
        GLOBAL: { type: "Selector", now: "Node 01", all: ["Node 01", "DIRECT"] },
        PROXY: { type: "Selector", now: "DIRECT", all: ["Node 01", "DIRECT"] },
        "Node 01": {
          type: "Shadowsocks",
          history: [
            { time: "t1", delay: 42 },
            { time: "t2", delay: 38 },
          ],
        },
        DIRECT: { type: "Direct", history: [] },
        ...overrides,
      },
    },
    error: undefined,
  };
}

function connectionsPayload(overrides = {}) {
  return {
    data: {
      uploadTotal: 12345,
      downloadTotal: 67890,
      connections: [{ id: "1" }, { id: "2" }, { id: "3" }],
      ...overrides,
    },
    error: undefined,
  };
}

describe("widgets/clash/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields to mode, active, up and down and renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "clash", url: "http://x" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["mode", "active", "up", "down"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("clash.mode")).toBeInTheDocument();
    expect(screen.getByText("clash.active")).toBeInTheDocument();
    expect(screen.getByText("clash.up")).toBeInTheDocument();
    expect(screen.getByText("clash.down")).toBeInTheDocument();
  });

  it("fetches configs, proxies and connections but not version by default", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "clash", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI.mock.calls.map((call) => call[1])).toEqual(["configs", "proxies", "connections", ""]);
  });

  it("fetches the version endpoint when the version field is selected", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(
      <Component service={{ widget: { type: "clash", fields: ["mode", "active", "up", "down", "version"] } }} />,
      { settings: { hideErrors: false } },
    );

    expect(useWidgetAPI.mock.calls.map((call) => call[1])).toEqual(["configs", "proxies", "connections", "version"]);
  });

  it("skips the connections call when none of its fields are selected", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "clash", fields: ["mode", "active", "latency"] } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI.mock.calls.map((call) => call[1])).toEqual(["configs", "proxies", "", ""]);
  });

  it("renders mode, active proxy and cumulative up/down totals by default", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "configs") return { data: { mode: "rule" }, error: undefined };
      if (endpoint === "proxies") return proxiesPayload();
      if (endpoint === "connections") return connectionsPayload();
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "clash" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "clash.mode", "rule");
    expectBlockValue(container, "clash.active", "Node 01");
    expectBlockValue(container, "clash.up", 12345);
    expectBlockValue(container, "clash.down", 67890);
  });

  it("uses the configured strategy group to determine the active proxy", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "configs") return { data: { mode: "global" }, error: undefined };
      if (endpoint === "proxies") return proxiesPayload();
      if (endpoint === "connections") return connectionsPayload();
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "clash", group: "PROXY" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "clash.active", "DIRECT");
  });

  it("renders the active connection count when the connections field is selected", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "configs") return { data: { mode: "rule" }, error: undefined };
      if (endpoint === "proxies") return proxiesPayload();
      if (endpoint === "connections") return connectionsPayload();
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "clash", fields: ["mode", "active", "up", "connections"] } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "clash.connections", 3);
  });

  it("renders the last known latency of the active node", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "configs") return { data: { mode: "rule" }, error: undefined };
      if (endpoint === "proxies") return proxiesPayload();
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "clash", fields: ["mode", "active", "latency"] } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "clash.latency", 38);
  });

  it("shows a dash for latency when the active proxy has no known delay", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "configs") return { data: { mode: "rule" }, error: undefined };
      if (endpoint === "proxies") return proxiesPayload();
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "clash", fields: ["mode", "active", "latency"], group: "PROXY" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "clash.latency", "-");
  });

  it("renders the version when the version field is selected", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "configs") return { data: { mode: "rule" }, error: undefined };
      if (endpoint === "proxies") return proxiesPayload();
      if (endpoint === "connections") return connectionsPayload();
      if (endpoint === "version") return { data: { meta: true, version: "v1.19.10" }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "clash", fields: ["mode", "active", "up", "version"] } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "clash.version", "v1.19.10");
  });

  it("respects the fields selection", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "configs") return { data: { mode: "rule" }, error: undefined };
      if (endpoint === "proxies") return proxiesPayload();
      if (endpoint === "connections") return connectionsPayload();
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "clash", fields: ["mode", "active"] } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expectBlockValue(container, "clash.mode", "rule");
    expectBlockValue(container, "clash.active", "Node 01");
  });

  it("renders the error state when an endpoint fails", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "proxies") return { data: undefined, error: { message: "unauthorized" } };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "clash" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });
});
