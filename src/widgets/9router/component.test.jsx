// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";
import widget from "./widget";

describe("widgets/9router/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "9router" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("9router.providers")).toBeInTheDocument();
  });

  it("renders counts when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "providers") {
        return {
          data: { connections: [{ isActive: true, testStatus: "active" }, { isActive: true }] },
          error: undefined,
        };
      }
      if (endpoint === "models") {
        return { data: { models: [1, 2, 3] }, error: undefined };
      }
      return { data: { combos: [1, 2] }, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "9router" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "9router.providers", 2);
    expectBlockValue(container, "9router.models", 3);
    expectBlockValue(container, "9router.combos", 2);
    expectBlockValue(container, "9router.status", "OK");
  });

  it("loads widget metadata", () => {
    expect(widget.api).toBe("{url}/api/{endpoint}");
  });

  it("filters inactive and unavailable providers", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "providers") {
        return {
          data: {
            connections: [
              { isActive: false, testStatus: "available" },
              { isActive: true, testStatus: "unavailable" },
              { isActive: true, testStatus: "available" },
            ],
          },
          error: undefined,
        };
      }
      if (endpoint === "models") {
        return { data: { models: [1] }, error: undefined };
      }
      return { data: { combos: [1] }, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "9router" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "9router.providers", 3);
    expectBlockValue(container, "9router.models", 1);
    expectBlockValue(container, "9router.combos", 1);
    expectBlockValue(container, "9router.status", "OK");
  });

  it("renders zero counts and down status when arrays are missing", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "providers") {
        return { data: { connections: undefined }, error: undefined };
      }
      if (endpoint === "models") {
        return { data: {}, error: undefined };
      }
      return { data: {}, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "9router" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "9router.providers", 0);
    expectBlockValue(container, "9router.models", 0);
    expectBlockValue(container, "9router.combos", 0);
    expectBlockValue(container, "9router.status", "Down");
  });

  it("renders error state", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "providers") {
        return { data: undefined, error: { message: "boom" } };
      }
      return { data: {}, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "9router" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.textContent).toContain("boom");
  });
});
