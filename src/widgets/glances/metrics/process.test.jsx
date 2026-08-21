// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));
vi.mock("components/resolvedicon", () => ({ default: () => <span data-testid="resolvedicon" /> }));

import Component from "./process";

describe("widgets/glances/metrics/process", () => {
  it("renders a placeholder while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });
    renderWithProviders(<Component service={{ widget: { chart: false, version: 3 } }} />, {
      settings: { hideErrors: false },
    });
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("limits displayed processes without modifying the response", () => {
    const data = [
      { pid: 1, status: "R", name: "first", cpu_percent: 1, memory_info: [100] },
      { pid: 2, status: "S", name: "second", cpu_percent: 2, memory_info: [200] },
    ];
    useWidgetAPI.mockReturnValue({ data, error: undefined });

    renderWithProviders(<Component service={{ widget: { chart: false, version: 3 } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("first")).toBeInTheDocument();
    expect(screen.queryByText("second")).not.toBeInTheDocument();
    expect(data).toHaveLength(2);
  });
});
