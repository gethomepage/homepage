// @vitest-environment jsdom

import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

describe("widgets/unmanic/component", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
    globalThis.fetch = vi.fn(async () => ({ json: async () => ({ recordsTotal: 7 }) }));
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("renders placeholders while loading pending data, then renders worker + pending stats", async () => {
    useWidgetAPI.mockReturnValue({ data: { active_workers: 1, total_workers: 2 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "unmanic" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("unmanic.active_workers")).toBeInTheDocument();
    expect(screen.getByText("unmanic.total_workers")).toBeInTheDocument();
    expect(screen.getByText("unmanic.records_total")).toBeInTheDocument();

    await waitFor(() => {
      expectBlockValue(container, "unmanic.active_workers", 1);
      expectBlockValue(container, "unmanic.total_workers", 2);
      expectBlockValue(container, "unmanic.records_total", 7);
    });
  });
});
