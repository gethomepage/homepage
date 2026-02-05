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

describe("widgets/transmission/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "transmission" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("transmission.leech")).toBeInTheDocument();
    expect(screen.getByText("transmission.download")).toBeInTheDocument();
    expect(screen.getByText("transmission.seed")).toBeInTheDocument();
    expect(screen.getByText("transmission.upload")).toBeInTheDocument();
  });

  it("computes leech/seed counts and upload/download rates when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        arguments: {
          torrents: [
            { rateDownload: 10, rateUpload: 1, percentDone: 1 },
            { rateDownload: 5, rateUpload: 2, percentDone: 0.5 },
          ],
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "transmission" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "transmission.leech", 1);
    expectBlockValue(container, "transmission.seed", 1);
    expectBlockValue(container, "transmission.download", 15);
    expectBlockValue(container, "transmission.upload", 3);
  });
});
