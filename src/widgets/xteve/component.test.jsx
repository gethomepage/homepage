// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/xteve/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "xteve" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("xteve.streams_all")).toBeInTheDocument();
    expect(screen.getByText("xteve.streams_active")).toBeInTheDocument();
    expect(screen.getByText("xteve.streams_xepg")).toBeInTheDocument();
  });

  it("renders counts when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { "streams.all": 10, "streams.active": 2, "streams.xepg": 3 },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "xteve" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "xteve.streams_all", 10);
    expectBlockValue(container, "xteve.streams_active", 2);
    expectBlockValue(container, "xteve.streams_xepg", 3);
  });
});
