// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component, { karakeepDefaultFields } from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/karakeep/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields and filters to 4 blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "karakeep", url: "http://x" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(karakeepDefaultFields);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("karakeep.bookmarks")).toBeInTheDocument();
    expect(screen.getByText("karakeep.favorites")).toBeInTheDocument();
    expect(screen.getByText("karakeep.archived")).toBeInTheDocument();
    expect(screen.getByText("karakeep.highlights")).toBeInTheDocument();
    expect(screen.queryByText("karakeep.lists")).toBeNull();
    expect(screen.queryByText("karakeep.tags")).toBeNull();
  });

  it("caps widget.fields at 4 entries", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "karakeep", fields: ["tags", "lists", "bookmarks", "favorites", "archived"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["tags", "lists", "bookmarks", "favorites"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("karakeep.tags")).toBeInTheDocument();
    expect(screen.getByText("karakeep.lists")).toBeInTheDocument();
  });

  it("renders values when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        numBookmarks: 1,
        numFavorites: 2,
        numArchived: 3,
        numHighlights: 4,
        numLists: 5,
        numTags: 6,
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "karakeep", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "karakeep.bookmarks", 1);
    expectBlockValue(container, "karakeep.favorites", 2);
    expectBlockValue(container, "karakeep.archived", 3);
    expectBlockValue(container, "karakeep.highlights", 4);
  });
});
