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

describe("widgets/photoprism/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "photoprism" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("photoprism.albums")).toBeInTheDocument();
    expect(screen.getByText("photoprism.photos")).toBeInTheDocument();
    expect(screen.getByText("photoprism.videos")).toBeInTheDocument();
    expect(screen.getByText("photoprism.people")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "photoprism" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders counts when loaded", () => {
    useWidgetAPI.mockReturnValue({ data: { albums: 1, photos: 2, videos: 3, people: 4 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "photoprism" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "photoprism.albums", 1);
    expectBlockValue(container, "photoprism.photos", 2);
    expectBlockValue(container, "photoprism.videos", 3);
    expectBlockValue(container, "photoprism.people", 4);
  });
});
