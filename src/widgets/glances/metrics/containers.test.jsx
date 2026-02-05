// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

// Avoid pulling Next/Image + ThemeContext requirements into these unit tests.
vi.mock("components/resolvedicon", () => ({ default: () => <span data-testid="resolvedicon" /> }));

import Component from "./containers";

describe("widgets/glances/metrics/containers", () => {
  it("renders a placeholder while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });
    renderWithProviders(<Component service={{ widget: { chart: false, version: 3 } }} />, {
      settings: { hideErrors: false },
    });
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
