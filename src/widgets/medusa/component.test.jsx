// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/medusa/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "medusa" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("medusa.wanted")).toBeInTheDocument();
    expect(screen.getByText("medusa.queued")).toBeInTheDocument();
    expect(screen.getByText("medusa.series")).toBeInTheDocument();
  });

  it("renders error UI when either endpoint errors", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "future") return { data: undefined, error: { message: "nope" } };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "medusa" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("computes wanted total from future lists and renders stats", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "future") {
        return {
          data: {
            data: {
              later: [{ id: 1 }],
              missed: [{ id: 2 }, { id: 3 }],
              soon: [],
              today: [{ id: 4 }, { id: 5 }, { id: 6 }],
            },
          },
          error: undefined,
        };
      }

      if (endpoint === "stats") {
        return { data: { data: { ep_snatched: 7, shows_active: 8 } }, error: undefined };
      }

      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "medusa" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "medusa.wanted", 6);
    expectBlockValue(container, "medusa.queued", 7);
    expectBlockValue(container, "medusa.series", 8);
  });
});
