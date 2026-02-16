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

describe("widgets/tubearchivist/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tubearchivist" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("tubearchivist.downloads")).toBeInTheDocument();
    expect(screen.getByText("tubearchivist.videos")).toBeInTheDocument();
    expect(screen.getByText("tubearchivist.channels")).toBeInTheDocument();
    expect(screen.getByText("tubearchivist.playlists")).toBeInTheDocument();
  });

  it("renders counts when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "downloads") return { data: { pending: 1 }, error: undefined };
      if (endpoint === "videos") return { data: { doc_count: 2 }, error: undefined };
      if (endpoint === "channels") return { data: { doc_count: 3 }, error: undefined };
      if (endpoint === "playlists") return { data: { doc_count: 4 }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tubearchivist" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "tubearchivist.downloads", 1);
    expectBlockValue(container, "tubearchivist.videos", 2);
    expectBlockValue(container, "tubearchivist.channels", 3);
    expectBlockValue(container, "tubearchivist.playlists", 4);
  });
});
