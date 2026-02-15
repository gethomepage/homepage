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

describe("widgets/healthchecks/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "healthchecks", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("healthchecks.status")).toBeInTheDocument();
    expect(screen.getByText("healthchecks.last_ping")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "healthchecks", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders up/down counts when widget.uuid is not set", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        checks: [{ status: "up" }, { status: "down" }, { status: "up" }, { status: "paused" }],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "healthchecks", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expectBlockValue(container, "healthchecks.up", 2);
    expectBlockValue(container, "healthchecks.down", 1);
  });

  it("renders status and never when widget.uuid is set but last_ping is missing", () => {
    useWidgetAPI.mockReturnValue({
      data: { status: "up", last_ping: null, checks: [] },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "healthchecks", url: "http://x", uuid: "abc" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expectBlockValue(container, "healthchecks.status", "healthchecks.up");
    expectBlockValue(container, "healthchecks.last_ping", "healthchecks.never");
  });
});
