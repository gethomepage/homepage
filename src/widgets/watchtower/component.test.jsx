// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/watchtower/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "watchtower" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("watchtower.containers_scanned")).toBeInTheDocument();
    expect(screen.getByText("watchtower.containers_updated")).toBeInTheDocument();
    expect(screen.getByText("watchtower.containers_failed")).toBeInTheDocument();
  });

  it("renders metrics when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { watchtower_containers_scanned: 1, watchtower_containers_updated: 2, watchtower_containers_failed: 3 },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "watchtower" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "watchtower.containers_scanned", 1);
    expectBlockValue(container, "watchtower.containers_updated", 2);
    expectBlockValue(container, "watchtower.containers_failed", 3);
  });
});
