// @vitest-environment jsdom

import { screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

import Component from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/uptimerobot/component", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("renders placeholders initially and then renders multi-monitor counts", async () => {
    globalThis.fetch = vi.fn(async () => ({
      json: async () => ({
        pagination: { total: 3 },
        monitors: [{ status: 2 }, { status: 9 }, { status: 2 }],
      }),
    }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "uptimerobot" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("uptimerobot.status")).toBeInTheDocument();
    expect(screen.getByText("uptimerobot.uptime")).toBeInTheDocument();

    await waitFor(() => {
      expectBlockValue(container, "uptimerobot.sitesUp", 2);
      expectBlockValue(container, "uptimerobot.sitesDown", 1);
    });
  });
});
