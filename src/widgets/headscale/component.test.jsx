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

describe("widgets/headscale/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "headscale", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("headscale.name")).toBeInTheDocument();
    expect(screen.getByText("headscale.address")).toBeInTheDocument();
    expect(screen.getByText("headscale.last_seen")).toBeInTheDocument();
    expect(screen.getByText("headscale.status")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "headscale", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders node details when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        node: {
          givenName: "node1",
          ipAddresses: ["100.64.0.1"],
          lastSeen: 123,
          online: true,
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "headscale", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expectBlockValue(container, "headscale.name", "node1");
    expectBlockValue(container, "headscale.address", "100.64.0.1");
    expectBlockValue(container, "headscale.last_seen", 123);
    expectBlockValue(container, "headscale.status", "headscale.online");
  });
});
