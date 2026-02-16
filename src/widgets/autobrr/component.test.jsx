// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const blocks = Array.from(container.querySelectorAll(".service-block"));
  const block = blocks.find((b) => b.textContent?.includes(label));
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/autobrr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "autobrr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("autobrr.approvedPushes")).toBeInTheDocument();
    expect(screen.getByText("autobrr.rejectedPushes")).toBeInTheDocument();
    expect(screen.getByText("autobrr.filters")).toBeInTheDocument();
    expect(screen.getByText("autobrr.indexers")).toBeInTheDocument();
  });

  it("renders values when loaded", () => {
    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "stats") return { data: { push_approved_count: 1, push_rejected_count: 2 }, error: undefined };
      if (endpoint === "filters") return { data: [{}, {}], error: undefined };
      if (endpoint === "indexers") return { data: [{}], error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "autobrr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "autobrr.approvedPushes", 1);
    expectBlockValue(container, "autobrr.rejectedPushes", 2);
    expectBlockValue(container, "autobrr.filters", 2);
    expectBlockValue(container, "autobrr.indexers", 1);
  });
});
