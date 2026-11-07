// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/wikijs/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders count blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "wikijs" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("wikijs.pages")).toBeInTheDocument();
    expect(useWidgetAPI).toHaveBeenCalledWith({ type: "wikijs" }, "metrics");
  });

  it("renders the Wiki.js counts", () => {
    useWidgetAPI.mockReturnValue({ data: { pages: 50, users: 8, groups: 3 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "wikijs" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "wikijs.pages", 50);
    expectBlockValue(container, "wikijs.users", 8);
    expectBlockValue(container, "wikijs.groups", 3);
  });
});