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

describe("widgets/pterodactyl/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pterodactyl" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("pterodactyl.nodes")).toBeInTheDocument();
    expect(screen.getByText("pterodactyl.servers")).toBeInTheDocument();
  });

  it("renders nodes and derived servers total when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          { attributes: { relationships: { servers: { data: [{ id: 1 }, { id: 2 }] } } } },
          { attributes: { relationships: { servers: { data: [{ id: 3 }] } } } },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pterodactyl" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "pterodactyl.nodes", 2);
    expectBlockValue(container, "pterodactyl.servers", 3);
  });
});
