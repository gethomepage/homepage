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

describe("widgets/downloadstation/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while tasks are missing", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "downloadstation" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("downloadstation.leech")).toBeInTheDocument();
    expect(screen.getByText("downloadstation.download")).toBeInTheDocument();
    expect(screen.getByText("downloadstation.seed")).toBeInTheDocument();
    expect(screen.getByText("downloadstation.upload")).toBeInTheDocument();
  });

  it("computes leech/seed counts and total upload/download rates", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: {
          tasks: [
            { size: 10, additional: { transfer: { size_downloaded: 10, speed_download: 5, speed_upload: 1 } } },
            { size: 20, additional: { transfer: { size_downloaded: 5, speed_download: 6, speed_upload: 2 } } },
          ],
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "downloadstation" } }} />, {
      settings: { hideErrors: false },
    });

    // completed = 1, leech = 1
    expectBlockValue(container, "downloadstation.seed", 1);
    expectBlockValue(container, "downloadstation.leech", 1);
    expectBlockValue(container, "downloadstation.download", 11);
    expectBlockValue(container, "downloadstation.upload", 3);
  });
});
