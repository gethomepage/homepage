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

describe("widgets/flood/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "flood", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders a helpful error when the API returns no torrent data", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "flood", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("No torrent data returned")).toBeInTheDocument();
  });

  it("renders computed leech/seed counts and up/down rates", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        torrents: {
          a: { downRate: 10, upRate: 20, status: ["downloading"] },
          b: { downRate: 5, upRate: 0, status: ["complete"] },
          c: { downRate: 0, upRate: 1, status: ["complete", "downloading"] },
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "flood", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "flood.leech", 2);
    expectBlockValue(container, "flood.download", 15);
    expectBlockValue(container, "flood.seed", 2);
    expectBlockValue(container, "flood.upload", 21);
  });
});
