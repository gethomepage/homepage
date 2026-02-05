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

describe("widgets/jdownloader/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "jdownloader", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("jdownloader.downloadCount")).toBeInTheDocument();
    expect(screen.getByText("jdownloader.downloadTotalBytes")).toBeInTheDocument();
    expect(screen.getByText("jdownloader.downloadBytesRemaining")).toBeInTheDocument();
    expect(screen.getByText("jdownloader.downloadSpeed")).toBeInTheDocument();
  });

  it("calls the unified endpoint with a 30s refresh interval", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "jdownloader", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI.mock.calls[0][1]).toBe("unified");
    expect(useWidgetAPI.mock.calls[0][2]?.refreshInterval).toBe(30000);
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "jdownloader", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders values when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        downloadCount: 1,
        totalBytes: 100,
        bytesRemaining: 40,
        totalSpeed: 10,
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "jdownloader", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "jdownloader.downloadCount", 1);
    expectBlockValue(container, "jdownloader.downloadTotalBytes", 100);
    expectBlockValue(container, "jdownloader.downloadBytesRemaining", 40);
    expectBlockValue(container, "jdownloader.downloadSpeed", 10);
  });
});
