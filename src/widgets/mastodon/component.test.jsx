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

describe("widgets/mastodon/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "mastodon", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("mastodon.user_count")).toBeInTheDocument();
    expect(screen.getByText("mastodon.status_count")).toBeInTheDocument();
    expect(screen.getByText("mastodon.domain_count")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "mastodon", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders instance stats when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { stats: { user_count: 1, status_count: 2, domain_count: 3 } },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "mastodon", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expectBlockValue(container, "mastodon.user_count", 1);
    expectBlockValue(container, "mastodon.status_count", 2);
    expectBlockValue(container, "mastodon.domain_count", 3);
  });
});
