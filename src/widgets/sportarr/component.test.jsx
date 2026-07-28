// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/sportarr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "sportarr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("sportarr.wanted")).toBeInTheDocument();
    expect(screen.getByText("sportarr.queued")).toBeInTheDocument();
    expect(screen.getByText("sportarr.leagues")).toBeInTheDocument();
  });

  it("renders counts when all endpoints resolve", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "wanted/missing") return { data: { totalRecords: 4 }, error: undefined };
      if (endpoint === "queue") return { data: { total: 2 }, error: undefined };
      if (endpoint === "leagues") return { data: { total: 7 }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "sportarr" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "sportarr.wanted", 4);
    expectBlockValue(container, "sportarr.queued", 2);
    expectBlockValue(container, "sportarr.leagues", 7);
  });

  it("renders the error state when an endpoint fails", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "queue") return { data: undefined, error: { message: "unreachable" } };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "sportarr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });
});
