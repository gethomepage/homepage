// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/npm/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "npm" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("npm.enabled")).toBeInTheDocument();
    expect(screen.getByText("npm.disabled")).toBeInTheDocument();
    expect(screen.getByText("npm.total")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "npm" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders enabled/disabled/total host counts", () => {
    useWidgetAPI.mockReturnValue({
      data: [{ enabled: true }, { enabled: false }, { enabled: 1 }, { enabled: 0 }, { enabled: true }],
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "npm" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "npm.enabled", 3);
    expectBlockValue(container, "npm.disabled", 2);
    expectBlockValue(container, "npm.total", 5);
  });
});
