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

describe("widgets/linkwarden/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "linkwarden" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("linkwarden.links")).toBeInTheDocument();
    expect(screen.getByText("linkwarden.collections")).toBeInTheDocument();
    expect(screen.getByText("linkwarden.tags")).toBeInTheDocument();
  });

  it("renders error UI when either endpoint errors", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "tags") return { data: undefined, error: { message: "nope" } };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "linkwarden" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("computes totals from collections + tags arrays", async () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "collections") {
        return {
          data: [{ _count: { links: 2 } }, { _count: { links: 3 } }],
          error: undefined,
        };
      }

      if (endpoint === "tags") {
        return { data: [{ id: 1 }, { id: 2 }, { id: 3 }, { id: 4 }], error: undefined };
      }

      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "linkwarden" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "linkwarden.links", 5);
    expectBlockValue(container, "linkwarden.collections", 2);
    expectBlockValue(container, "linkwarden.tags", 4);
  });
});
