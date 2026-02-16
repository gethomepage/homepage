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

describe("widgets/immich/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses v1 endpoints and renders placeholders while loading", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // version
      .mockReturnValueOnce({ data: undefined, error: undefined }); // stats

    const { container } = renderWithProviders(<Component service={{ widget: { type: "immich", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI.mock.calls[0][1]).toBe("version");
    expect(useWidgetAPI.mock.calls[1][1]).toBe("stats");
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("immich.users")).toBeInTheDocument();
    expect(screen.getByText("immich.photos")).toBeInTheDocument();
    expect(screen.getByText("immich.videos")).toBeInTheDocument();
    expect(screen.getByText("immich.storage")).toBeInTheDocument();
  });

  it("selects the v1 statistics endpoint when version is > 1.84", () => {
    useWidgetAPI.mockReturnValueOnce({ data: { major: 1, minor: 85 }, error: undefined }).mockReturnValueOnce({
      data: { usageByUser: [{ id: 1 }, { id: 2 }], photos: 3, videos: 4, usage: "9 GiB" },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "immich", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI.mock.calls[1][1]).toBe("statistics");
    expectBlockValue(container, "immich.users", 2);
    expectBlockValue(container, "immich.photos", 3);
    expectBlockValue(container, "immich.videos", 4);
    expectBlockValue(container, "immich.storage", "9 GiB");
  });

  it("uses v2 endpoints when widget.version === 2", () => {
    useWidgetAPI.mockReturnValueOnce({ data: { major: 2, minor: 0 }, error: undefined }).mockReturnValueOnce({
      data: { usageByUser: [], photos: 0, videos: 0, usage: 0 },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "immich", url: "http://x", version: 2 } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI.mock.calls[0][1]).toBe("version_v2");
    expect(useWidgetAPI.mock.calls[1][1]).toBe("statistics_v2");
  });
});
