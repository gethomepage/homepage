// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component, { shelfmarkDefaultFields } from "./component";

describe("widgets/shelfmark/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "shelfmark" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(shelfmarkDefaultFields);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("shelfmark.requested")).toBeInTheDocument();
    expect(screen.getByText("shelfmark.downloading")).toBeInTheDocument();
    expect(screen.getByText("shelfmark.complete")).toBeInTheDocument();
    expect(screen.getByText("shelfmark.error")).toBeInTheDocument();
  });

  it("auto-selects prioritized status keys from status data", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        statuses: {
          queued: 4,
          available: 2,
          done: 3,
          error: 1,
          resolving: 5,
        },
      },
      error: undefined,
    });

    const service = { widget: { type: "shelfmark" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["available", "error", "done", "queued"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "shelfmark.available", 2);
    expectBlockValue(container, "shelfmark.error", 1);
    expectBlockValue(container, "shelfmark.done", 3);
    expectBlockValue(container, "shelfmark.queued", 4);
  });
});
