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

describe("widgets/readarr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "readarr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("readarr.wanted")).toBeInTheDocument();
    expect(screen.getByText("readarr.queued")).toBeInTheDocument();
    expect(screen.getByText("readarr.books")).toBeInTheDocument();
  });

  it("renders counts when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "book") return { data: { have: 10 }, error: undefined };
      if (endpoint === "wanted/missing") return { data: { totalRecords: 2 }, error: undefined };
      if (endpoint === "queue/status") return { data: { totalCount: 3 }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "readarr" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "readarr.wanted", 2);
    expectBlockValue(container, "readarr.queued", 3);
    expectBlockValue(container, "readarr.books", 10);
  });
});
