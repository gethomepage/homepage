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

describe("widgets/gitlab/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "gitlab", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("gitlab.groups")).toBeInTheDocument();
    expect(screen.getByText("gitlab.issues")).toBeInTheDocument();
    expect(screen.getByText("gitlab.merges")).toBeInTheDocument();
    expect(screen.getByText("gitlab.projects")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(4);
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "gitlab", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders counts when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { groups_count: 1, issues_count: 2, merge_requests_count: 3, projects_count: 4 },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "gitlab", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "gitlab.groups", 1);
    expectBlockValue(container, "gitlab.issues", 2);
    expectBlockValue(container, "gitlab.merges", 3);
    expectBlockValue(container, "gitlab.projects", 4);
  });
});
