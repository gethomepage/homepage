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

describe("widgets/yourspotify/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders when any metric is NaN", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "songs") return { data: NaN, error: undefined };
      if (endpoint === "time") return { data: 0, error: undefined };
      if (endpoint === "artists") return { data: 0, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "yourspotify" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("yourspotify.songs")).toBeInTheDocument();
    expect(screen.getByText("yourspotify.time")).toBeInTheDocument();
    expect(screen.getByText("yourspotify.artists")).toBeInTheDocument();
  });

  it("renders songs, time and artists when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "songs") return { data: 1, error: undefined };
      if (endpoint === "time") return { data: 2000, error: undefined };
      if (endpoint === "artists") return { data: 3, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "yourspotify" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "yourspotify.songs", 1);
    expectBlockValue(container, "yourspotify.time", 2);
    expectBlockValue(container, "yourspotify.artists", 3);
  });
});
