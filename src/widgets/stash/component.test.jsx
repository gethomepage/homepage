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

describe("widgets/stash/component", () => {
  const originalFetch = globalThis.fetch;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("renders placeholders initially, then renders stats after fetch", async () => {
    globalThis.fetch = vi.fn(async () => ({
      json: async () => ({
        scene_count: 1,
        scenes_played: 2,
        total_play_count: 3,
        total_play_duration: 4,
        scenes_size: 5,
        scenes_duration: 6,
        image_count: 7,
        images_size: 8,
        gallery_count: 9,
        performer_count: 10,
        studio_count: 11,
        movie_count: 12,
        tag_count: 13,
        total_o_count: 14,
      }),
    }));

    const service = { widget: { type: "stash", url: "http://x", key: "k" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getByText("stash.scenes")).toBeInTheDocument();
    expect(screen.getByText("stash.images")).toBeInTheDocument();

    await waitFor(() => {
      expectBlockValue(container, "stash.scenes", 1);
      expectBlockValue(container, "stash.images", 7);
    });
  });
});
