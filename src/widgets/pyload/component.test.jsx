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

describe("widgets/pyload/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pyload" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("pyload.speed")).toBeInTheDocument();
    expect(screen.getByText("pyload.active")).toBeInTheDocument();
    expect(screen.getByText("pyload.queue")).toBeInTheDocument();
    expect(screen.getByText("pyload.total")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "pyload" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders status counts when loaded", () => {
    useWidgetAPI.mockReturnValue({ data: { speed: 100, active: 1, queue: 2, total: 3 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pyload" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "pyload.speed", 100);
    expectBlockValue(container, "pyload.active", 1);
    expectBlockValue(container, "pyload.queue", 2);
    expectBlockValue(container, "pyload.total", 3);
  });
});
