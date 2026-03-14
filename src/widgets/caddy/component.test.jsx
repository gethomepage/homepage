// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/caddy/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "caddy" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("caddy.upstreams")).toBeInTheDocument();
    expect(screen.getByText("caddy.requests")).toBeInTheDocument();
    expect(screen.getByText("caddy.requests_failed")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "caddy" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("computes upstream/request totals when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        { num_requests: 10, fails: 1 },
        { num_requests: 5, fails: 2 },
      ],
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "caddy" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "caddy.upstreams", 2);
    expectBlockValue(container, "caddy.requests", 15);
    expectBlockValue(container, "caddy.requests_failed", 3);
  });
});
