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

describe("widgets/overseerr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "overseerr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("overseerr.pending")).toBeInTheDocument();
    expect(screen.getByText("overseerr.processing")).toBeInTheDocument();
    expect(screen.getByText("overseerr.approved")).toBeInTheDocument();
    expect(screen.getByText("overseerr.available")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "overseerr" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders request counts when loaded", () => {
    useWidgetAPI.mockReturnValue({ data: { pending: 1, processing: 2, approved: 3, available: 4 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "overseerr" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "overseerr.pending", 1);
    expectBlockValue(container, "overseerr.processing", 2);
    expectBlockValue(container, "overseerr.approved", 3);
    expectBlockValue(container, "overseerr.available", 4);
  });
});
