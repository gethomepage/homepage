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

describe("widgets/nzbget/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "nzbget" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("nzbget.rate")).toBeInTheDocument();
    expect(screen.getByText("nzbget.remaining")).toBeInTheDocument();
    expect(screen.getByText("nzbget.downloaded")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "nzbget" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders rate and sizes when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { DownloadRate: 1234, RemainingSizeMB: 2, DownloadedSizeMB: 3 },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "nzbget" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "nzbget.rate", 1234);
    expectBlockValue(container, "nzbget.remaining", 2 * 1024 * 1024);
    expectBlockValue(container, "nzbget.downloaded", 3 * 1024 * 1024);
  });
});
