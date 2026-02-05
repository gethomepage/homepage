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

describe("widgets/mylar/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "mylar" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("mylar.series")).toBeInTheDocument();
    expect(screen.getByText("mylar.issues")).toBeInTheDocument();
    expect(screen.getByText("mylar.wanted")).toBeInTheDocument();
  });

  it("renders error UI when any endpoint errors", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "issues") return { data: undefined, error: { message: "nope" } };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "mylar" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders series count, total issues, and wanted issues", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "series") return { data: { data: [{ id: 1 }, { id: 2 }] }, error: undefined };
      if (endpoint === "issues") {
        return { data: { data: [{ totalIssues: 3 }, { totalIssues: 4 }] }, error: undefined };
      }
      if (endpoint === "wanted") return { data: { issues: [{ id: 1 }] }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "mylar" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "mylar.series", 2);
    expectBlockValue(container, "mylar.issues", 7);
    expectBlockValue(container, "mylar.wanted", 1);
  });
});
