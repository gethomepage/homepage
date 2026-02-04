// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));
vi.mock("next/dynamic", () => ({ default: () => () => null }));

import Component from "./gpu";

describe("widgets/glances/metrics/gpu", () => {
  it("renders a placeholder while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });
    renderWithProviders(
      <Component service={{ widget: { chart: false, version: 3, pointsLimit: 3, metric: "gpu:gpu0" } }} />,
      {
        settings: { hideErrors: false },
      },
    );
    expect(screen.getByText("-")).toBeInTheDocument();
  });
});
