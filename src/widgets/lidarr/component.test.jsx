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

describe("widgets/lidarr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // artist
      .mockReturnValueOnce({ data: undefined, error: undefined }) // wanted/missing
      .mockReturnValueOnce({ data: undefined, error: undefined }); // queue/status

    const { container } = renderWithProviders(<Component service={{ widget: { type: "lidarr", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("lidarr.wanted")).toBeInTheDocument();
    expect(screen.getByText("lidarr.queued")).toBeInTheDocument();
    expect(screen.getByText("lidarr.artists")).toBeInTheDocument();
  });

  it("renders error UI when any endpoint errors", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: { message: "nope" } })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "lidarr", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders wanted/queued/artist counts when loaded", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: [{ id: 1 }, { id: 2 }], error: undefined })
      .mockReturnValueOnce({ data: { totalRecords: 10 }, error: undefined })
      .mockReturnValueOnce({ data: { totalCount: 3 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "lidarr", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "lidarr.wanted", 10);
    expectBlockValue(container, "lidarr.queued", 3);
    expectBlockValue(container, "lidarr.artists", 2);
  });
});
