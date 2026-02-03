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

describe("widgets/mealie/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses v1 endpoint by default and renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "mealie", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI.mock.calls[0][1]).toBe("statisticsv1");
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("mealie.recipes")).toBeInTheDocument();
    expect(screen.getByText("mealie.users")).toBeInTheDocument();
    expect(screen.getByText("mealie.categories")).toBeInTheDocument();
    expect(screen.getByText("mealie.tags")).toBeInTheDocument();
  });

  it("uses v2 endpoint when widget.version === 2 and renders counts", () => {
    useWidgetAPI.mockReturnValue({
      data: { totalRecipes: 1, totalUsers: 2, totalCategories: 3, totalTags: 4 },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "mealie", url: "http://x", version: 2 } }} />,
      { settings: { hideErrors: false } },
    );

    expect(useWidgetAPI.mock.calls[0][1]).toBe("statisticsv2");
    expectBlockValue(container, "mealie.recipes", 1);
    expectBlockValue(container, "mealie.users", 2);
    expectBlockValue(container, "mealie.categories", 3);
    expectBlockValue(container, "mealie.tags", 4);
  });
});
