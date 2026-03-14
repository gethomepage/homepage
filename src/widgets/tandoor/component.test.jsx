// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/tandoor/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tandoor" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("tandoor.users")).toBeInTheDocument();
    expect(screen.getByText("tandoor.recipes")).toBeInTheDocument();
    expect(screen.getByText("tandoor.keywords")).toBeInTheDocument();
  });

  it("renders values when loaded (spaceData.results shape)", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "space") return { data: { results: [{ user_count: 1, recipe_count: 2 }] }, error: undefined };
      if (endpoint === "keyword") return { data: { count: 3 }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tandoor" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "tandoor.users", 1);
    expectBlockValue(container, "tandoor.recipes", 2);
    expectBlockValue(container, "tandoor.keywords", 3);
  });
});
