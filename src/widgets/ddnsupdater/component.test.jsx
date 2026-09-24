// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/ddnsupdater/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "ddnsupdater" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("ddnsupdater.status")).toBeInTheDocument();
    expect(screen.getByText("ddnsupdater.currentIP")).toBeInTheDocument();
    expect(screen.getByText("ddnsupdater.timeSinceLastUpdate")).toBeInTheDocument();
    expect(screen.getByText("ddnsupdater.previousIP")).toBeInTheDocument();
  });

  it("renders values when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { status: "Success", currentIP: "8.8.4.4", timeSinceLastUpdate: "12h34m56s", previousIP: "22.11.44.33" },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "ddnsupdater" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("Success")).toBeInTheDocument();
    expect(screen.getByText("8.8.4.4")).toBeInTheDocument();
    expect(screen.getByText("12h34m56s")).toBeInTheDocument();
    expect(screen.getByText("22.11.44.33")).toBeInTheDocument();
  });
});
