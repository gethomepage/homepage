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

describe("widgets/fileflows/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "fileflows", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("fileflows.queue")).toBeInTheDocument();
    expect(screen.getByText("fileflows.processing")).toBeInTheDocument();
    expect(screen.getByText("fileflows.processed")).toBeInTheDocument();
    expect(screen.getByText("fileflows.time")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(4);
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "fileflows", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders values and falls back time to 0:00", () => {
    useWidgetAPI.mockReturnValue({
      data: { queue: 1, processing: 2, processed: 3, time: "" },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "fileflows", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expectBlockValue(container, "fileflows.queue", 1);
    expectBlockValue(container, "fileflows.processing", 2);
    expectBlockValue(container, "fileflows.processed", 3);
    expectBlockValue(container, "fileflows.time", "0:00");
  });
});
