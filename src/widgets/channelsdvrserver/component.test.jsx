// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/channelsdvrserver/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "channelsdvrserver" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("channelsdvrserver.shows")).toBeInTheDocument();
    expect(screen.getByText("channelsdvrserver.recordings")).toBeInTheDocument();
    expect(screen.getByText("channelsdvrserver.scheduled")).toBeInTheDocument();
    expect(screen.getByText("channelsdvrserver.passes")).toBeInTheDocument();
  });

  it("renders values when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { stats: { groups: 1, files: 2, jobs: 3, rules: 4 } },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "channelsdvrserver" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "channelsdvrserver.shows", 1);
    expectBlockValue(container, "channelsdvrserver.recordings", 2);
    expectBlockValue(container, "channelsdvrserver.scheduled", 3);
    expectBlockValue(container, "channelsdvrserver.passes", 4);
  });
});
