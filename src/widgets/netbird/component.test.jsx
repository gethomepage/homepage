// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/netbird/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "netbird", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("netbird.online")).toBeInTheDocument();
    expect(screen.getByText("netbird.offline")).toBeInTheDocument();
    expect(screen.getByText("netbird.total")).toBeInTheDocument();
    expect(screen.getByText("netbird.routes")).toBeInTheDocument();
  });

  it("renders error UI when the peers API errors", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "peers") return { data: undefined, error: { message: "peers down" } };
      return { data: [], error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "netbird", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("peers down")).toBeInTheDocument();
  });

  it("renders error UI when the routes API errors", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "routes") return { data: undefined, error: { message: "routes down" } };
      return { data: [], error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "netbird", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("routes down")).toBeInTheDocument();
  });

  it("computes online/offline/total peers and routes count when loaded", () => {
    const peers = [{ connected: true }, { connected: true }, { connected: false }];
    const routes = [{ id: "r1" }, { id: "r2" }];

    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "peers") return { data: peers, error: undefined };
      if (endpoint === "routes") return { data: routes, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "netbird", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "netbird.online", 2);
    expectBlockValue(container, "netbird.offline", 1);
    expectBlockValue(container, "netbird.total", 3);
    expectBlockValue(container, "netbird.routes", 2);
  });
});
