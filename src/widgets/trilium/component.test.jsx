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

describe("widgets/trilium/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "trilium" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("trilium.version")).toBeInTheDocument();
    expect(screen.getByText("trilium.notesCount")).toBeInTheDocument();
    expect(screen.getByText("trilium.dbSize")).toBeInTheDocument();
  });

  it("renders metrics when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { version: { app: "1.0.0" }, database: { activeNotes: 2 }, statistics: { databaseSizeBytes: 1024 } },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "trilium" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "trilium.version", "v1.0.0");
    expectBlockValue(container, "trilium.notesCount", 2);
    expectBlockValue(container, "trilium.dbSize", 1024);
  });
});
