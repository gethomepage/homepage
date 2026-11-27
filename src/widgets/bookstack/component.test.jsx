// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/bookstack/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "bookstack" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("bookstack.shelves")).toBeInTheDocument();
    expect(screen.getByText("bookstack.books")).toBeInTheDocument();
    expect(screen.getByText("bookstack.chapters")).toBeInTheDocument();
    expect(screen.getByText("bookstack.pages")).toBeInTheDocument();
  });

  it("renders totals for shelves, books, chapters, and pages", () => {
    useWidgetAPI.mockReturnValue({
      data: { shelves: 1, books: 4, chapters: 8, pages: 16 },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "bookstack" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "bookstack.shelves", 1);
    expectBlockValue(container, "bookstack.books", 4);
    expectBlockValue(container, "bookstack.chapters", 8);
    expectBlockValue(container, "bookstack.pages", 16);
  });

  it("renders error UI when the widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "bookstack" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });
});
