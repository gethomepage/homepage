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

  it("renders no blocks for a non-array object payload", () => {
    useWidgetAPI.mockReturnValue({ data: { message: "Unauthorized" }, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "homeassistant", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(document.querySelectorAll(".service-block").length).toBe(0);
  });

  it("renders no blocks for a non-array numeric payload", () => {
    useWidgetAPI.mockReturnValue({ data: 42, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "homeassistant", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(document.querySelectorAll(".service-block").length).toBe(0);
  });

  it("renders zero blocks for [null]", () => {
    useWidgetAPI.mockReturnValue({ data: [null], error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "homeassistant", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(document.querySelectorAll(".service-block").length).toBe(0);
  });

  it("renders exactly one block for [valid, null]", () => {
    useWidgetAPI.mockReturnValue({ data: [{ label: "a", value: "1" }, null], error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "homeassistant", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    const blocks = document.querySelectorAll(".service-block");
    expect(blocks.length).toBe(1);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("1")).toBeInTheDocument();
  });

  it("renders safely for [{}]", () => {
    useWidgetAPI.mockReturnValue({ data: [{}], error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "homeassistant", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    const blocks = document.querySelectorAll(".service-block");
    expect(blocks.length).toBe(1);
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders safely for [{label:null,value:'x'}]", () => {
    useWidgetAPI.mockReturnValue({ data: [{ label: null, value: "x" }], error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "homeassistant", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    const blocks = document.querySelectorAll(".service-block");
    expect(blocks.length).toBe(1);
    expect(screen.getByText("x")).toBeInTheDocument();
  });
});
