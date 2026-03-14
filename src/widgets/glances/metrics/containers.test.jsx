// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

// Avoid pulling Next/Image + ThemeContext requirements into these unit tests.
vi.mock("components/resolvedicon", () => ({ default: () => <span data-testid="resolvedicon" /> }));

vi.mock("next-i18next", () => ({
  useTranslation: () => ({
    t: (key, opts) => (key === "common.bytes" ? `${key}:${opts?.value}` : key),
  }),
}));

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

  it("renders a placeholder while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });
    renderWithProviders(<Component service={{ widget: { chart: false, version: 3 } }} />, {
      settings: { hideErrors: false },
    });
    expect(screen.getByText("-")).toBeInTheDocument();
  });

  it("renders nothing when there is an error", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: new Error("fail") });
    renderWithProviders(<Component service={{ widget: { chart: false, version: 3 } }} />, {
      settings: { hideErrors: false },
    });
    expect(screen.queryByText("resources.cpu")).not.toBeInTheDocument();
    expect(screen.queryByText("-")).not.toBeInTheDocument();
  });

  it("renders container rows using v3 keys and formats values", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        {
          Id: "one",
          Status: "running",
          name: "alpha",
          cpu_percent: 12.34,
          memory: { usage: 1000, inactive_file: 400 },
        },
        {
          Id: "two",
          Status: "paused",
          name: "beta",
          cpu_percent: 99.99,
          memory: { usage: 2000, inactive_file: 1000 },
        },
      ],
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { chart: false, version: 3 } }} />, {
      settings: { hideErrors: false },
    });

    // data.splice(1) keeps only one item when chart is false
    expect(screen.getByText("resources.cpu")).toBeInTheDocument();
    expect(screen.getByText("resources.mem")).toBeInTheDocument();

    expect(screen.getByText("alpha")).toBeInTheDocument();
    expect(screen.queryByText("beta")).not.toBeInTheDocument();

    expect(screen.getByText("12.3%")).toBeInTheDocument();
    expect(screen.getByText("common.bytes:600")).toBeInTheDocument();
    expect(screen.getAllByTestId("resolvedicon")).toHaveLength(1);
  });

  it("limits rows to 5 when chart is enabled", () => {
    const data = Array.from({ length: 6 }).map((_, index) => ({
      Id: `id-${index}`,
      Status: "healthy",
      name: `item-${index}`,
      cpu_percent: index + 0.1,
      memory: { usage: 100 * (index + 1), inactive_file: 0 },
    }));

    useWidgetAPI.mockReturnValue({ data, error: undefined });

    renderWithProviders(<Component service={{ widget: { chart: true, version: 3 } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("item-0")).toBeInTheDocument();
    expect(screen.getByText("item-4")).toBeInTheDocument();
    expect(screen.queryByText("item-5")).not.toBeInTheDocument();
  });
});
