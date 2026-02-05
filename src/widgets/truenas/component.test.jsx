// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

// Pool is rendered outside of the main Container; stub it to a simple marker.
vi.mock("widgets/truenas/pool", () => ({
  default: ({ name, healthy, allocated, free }) => (
    <div
      data-testid="truenas-pool"
      data-name={name}
      data-healthy={String(healthy)}
      data-allocated={allocated}
      data-free={free}
    />
  ),
}));

import Component from "./component";

describe("widgets/truenas/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading (no pools)", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "truenas" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("truenas.load")).toBeInTheDocument();
    expect(screen.getByText("truenas.uptime")).toBeInTheDocument();
    expect(screen.getByText("truenas.alerts")).toBeInTheDocument();
    expect(screen.queryByTestId("truenas-pool")).toBeNull();
  });

  it("renders values and pool list when enablePools is on and data is present", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "alerts") return { data: { pending: 7 }, error: undefined };
      if (endpoint === "status") return { data: { loadavg: [1.23], uptime_seconds: 3600 }, error: undefined };
      if (endpoint === "pools") return { data: [{ id: "1", name: "tank", healthy: true }], error: undefined };
      if (endpoint === "dataset")
        return {
          data: [{ pool: "tank", name: "tank", used: { parsed: 10 }, available: { parsed: 20 } }],
          error: undefined,
        };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "truenas", enablePools: true } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("1.23")).toBeInTheDocument();
    expect(screen.getByText("3600")).toBeInTheDocument(); // common.duration mocked
    expect(screen.getByText("7")).toBeInTheDocument();

    const pool = screen.getByTestId("truenas-pool");
    expect(pool.getAttribute("data-name")).toBe("tank");
    expect(pool.getAttribute("data-healthy")).toBe("true");
    expect(pool.getAttribute("data-allocated")).toBe("10");
    expect(pool.getAttribute("data-free")).toBe("20");
  });
});
