// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/komga/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "komga", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("komga.libraries")).toBeInTheDocument();
    expect(screen.getByText("komga.series")).toBeInTheDocument();
    expect(screen.getByText("komga.books")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "komga", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders library/series/book totals when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        libraries: [{ id: 1 }, { id: 2 }],
        series: { totalElements: 10 },
        books: { totalElements: 20 },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "komga", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "komga.libraries", 2);
    expectBlockValue(container, "komga.series", 10);
    expectBlockValue(container, "komga.books", 20);
  });
});
