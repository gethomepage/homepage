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

describe("widgets/minecraft/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "minecraft" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("minecraft.status")).toBeInTheDocument();
    expect(screen.getByText("minecraft.players")).toBeInTheDocument();
    expect(screen.getByText("minecraft.version")).toBeInTheDocument();
  });

  it("renders error UI when status endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "minecraft" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders status, players, and version when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        online: true,
        players: { online: 2, max: 10 },
        version: "1.20.1",
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "minecraft" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "minecraft.status", "minecraft.up");
    expectBlockValue(container, "minecraft.players", "2 / 10");
    expectBlockValue(container, "minecraft.version", "1.20.1");
  });
});
