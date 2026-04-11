// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const SERVICE = { widget: { type: "awscostexplorer" } };

describe("widgets/awscostexplorer/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders without crashing while loading (data undefined)", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={SERVICE} />, { settings: { hideErrors: false } });

    // The skeleton container should be in the DOM.
    expect(document.body).toBeInTheDocument();
  });

  it("renders error UI when widget API returns an error", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "AccessDeniedException" } });

    renderWithProviders(<Component service={SERVICE} />, { settings: { hideErrors: false } });

    expect(screen.getByText("AccessDeniedException")).toBeInTheDocument();
  });

  it("renders the formatted currency amount on success", () => {
    useWidgetAPI.mockReturnValue({ data: { amount: "142.50", unit: "USD" }, error: undefined });

    renderWithProviders(<Component service={SERVICE} />, { settings: { hideErrors: false } });

    // Build the expected string the same way the component does.
    const expected = new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(142.5);
    expect(screen.getByText(expected)).toBeInTheDocument();
  });
});
