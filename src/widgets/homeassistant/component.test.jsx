// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/homeassistant/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "homeassistant", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders blocks returned from the API", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        { label: "ha.temp", value: "72" },
        { label: "ha.mode", value: "cool" },
      ],
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "homeassistant", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("ha.temp")).toBeInTheDocument();
    expect(screen.getByText("72")).toBeInTheDocument();
    expect(screen.getByText("ha.mode")).toBeInTheDocument();
    expect(screen.getByText("cool")).toBeInTheDocument();
  });
});
