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

describe("widgets/paperlessngx/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "paperlessngx" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("paperlessngx.inbox")).toBeInTheDocument();
    expect(screen.getByText("paperlessngx.total")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "paperlessngx" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders total and inbox when present", () => {
    useWidgetAPI.mockReturnValue({ data: { documents_inbox: 2, documents_total: 10 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "paperlessngx" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "paperlessngx.inbox", 2);
    expectBlockValue(container, "paperlessngx.total", 10);
  });

  it("omits inbox block when documents_inbox is undefined", () => {
    useWidgetAPI.mockReturnValue({ data: { documents_total: 10 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "paperlessngx" } }} />, {
      settings: { hideErrors: false },
    });

    expect(findServiceBlockByLabel(container, "paperlessngx.inbox")).toBeUndefined();
    expectBlockValue(container, "paperlessngx.total", 10);
  });
});
