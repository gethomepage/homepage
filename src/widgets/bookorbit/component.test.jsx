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

import Component from "./component";

describe("widgets/bookorbit/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "bookorbit" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("bookorbit.libraries")).toBeInTheDocument();
    expect(screen.getByText("bookorbit.books")).toBeInTheDocument();
    expect(screen.getByText("bookorbit.reading")).toBeInTheDocument();
    expect(screen.getByText("bookorbit.finished")).toBeInTheDocument();
  });

  it("renders values with nullish fallback defaults", () => {
    useWidgetAPI.mockReturnValue({
      data: { libraries: 1, books: 2, finished: 4 }, // reading missing -> 0
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "bookorbit" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });
});
