// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/tugtainer/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tugtainer" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("tugtainer.total_containers")).toBeInTheDocument();
    expect(screen.getByText("tugtainer.running_containers")).toBeInTheDocument();
    expect(screen.getByText("tugtainer.update_count")).toBeInTheDocument();
  });

  it("renders metrics when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "summary") {
        return {
          data: [{ total_containers: 22, by_status: { running: 20 } }],
          error: undefined,
        };
      }

      if (endpoint === "update_count") {
        return {
          data: { total_updates: 3 },
          error: undefined,
        };
      }

      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tugtainer" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "tugtainer.total_containers", 22);
    expectBlockValue(container, "tugtainer.running_containers", 20);
    expectBlockValue(container, "tugtainer.update_count", 3);
  });

  it("renders error UI when either request errors", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "summary") {
        return { data: undefined, error: { message: "summary failed" } };
      }

      return { data: { total_updates: 1 }, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "tugtainer" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("summary failed")).toBeInTheDocument();
  });

  it("renders error UI when summary is empty", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "summary") {
        return { data: [], error: undefined };
      }

      return { data: { total_updates: 1 }, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "tugtainer" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Invalid data")).toBeInTheDocument();
  });

  it("renders error UI when summary payload is malformed", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "summary") {
        return {
          data: [{ total_containers: "22", by_status: null }],
          error: undefined,
        };
      }

      return { data: { total_updates: 1 }, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "tugtainer" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Invalid data")).toBeInTheDocument();
  });

  it("renders error UI when update_count payload is malformed", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "summary") {
        return {
          data: [{ total_containers: 22, by_status: { running: 20 } }],
          error: undefined,
        };
      }

      return { data: { total_updates: "3" }, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "tugtainer" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("Invalid data")).toBeInTheDocument();
  });
});
