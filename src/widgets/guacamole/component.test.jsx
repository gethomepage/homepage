// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/guacamole/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "guacamole" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("guacamole.active")).toBeInTheDocument();
    expect(screen.getByText("guacamole.connections")).toBeInTheDocument();
    expect(screen.getByText("guacamole.users")).toBeInTheDocument();
  });

  it("renders error UI when an endpoint errors", () => {
    useWidgetAPI.mockImplementation((widgetConfig, endpoint) => {
      if (endpoint === "activeConnections") {
        return { data: undefined, error: { message: "nope" } };
      }
      return { data: {}, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "guacamole" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders active session, connection, and user counts", () => {
    useWidgetAPI.mockImplementation((widgetConfig, endpoint) => {
      if (endpoint === "activeConnections") {
        return { data: { 1: {}, 2: {} }, error: undefined };
      }
      if (endpoint === "connections") {
        return { data: { 1: {}, 2: {}, 3: {}, 4: {} }, error: undefined };
      }
      if (endpoint === "users") {
        return { data: { 1: {}, 2: {}, 3: {} }, error: undefined };
      }
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "guacamole" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "guacamole.active", 2);
    expectBlockValue(container, "guacamole.connections", 4);
    expectBlockValue(container, "guacamole.users", 3);
  });
});
