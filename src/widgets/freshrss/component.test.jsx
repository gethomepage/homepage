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

describe("widgets/freshrss/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "freshrss", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("freshrss.unread")).toBeInTheDocument();
    expect(screen.getByText("freshrss.subscriptions")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "freshrss", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders unread and subscription counts", () => {
    useWidgetAPI.mockReturnValue({ data: { unread: 7, subscriptions: 3 }, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "freshrss", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expectBlockValue(container, "freshrss.unread", 7);
    expectBlockValue(container, "freshrss.subscriptions", 3);
  });
});
