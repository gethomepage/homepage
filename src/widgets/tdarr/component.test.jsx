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

describe("widgets/tdarr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tdarr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("tdarr.queue")).toBeInTheDocument();
    expect(screen.getByText("tdarr.processed")).toBeInTheDocument();
    expect(screen.getByText("tdarr.errored")).toBeInTheDocument();
    expect(screen.getByText("tdarr.saved")).toBeInTheDocument();
  });

  it("computes queue/processed/errored/saved when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        table1Count: "1",
        table2Count: "2",
        table3Count: "3",
        table4Count: "4",
        table5Count: "5",
        table6Count: "6",
        sizeDiff: "1.5",
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tdarr" } }} />, {
      settings: { hideErrors: false },
    });

    // queue = 1+4, processed = 2+5, errored = 3+6
    expectBlockValue(container, "tdarr.queue", 5);
    expectBlockValue(container, "tdarr.processed", 7);
    expectBlockValue(container, "tdarr.errored", 9);
    // saved = 1.5 * 1e9
    expectBlockValue(container, "tdarr.saved", 1_500_000_000);
  });
});
