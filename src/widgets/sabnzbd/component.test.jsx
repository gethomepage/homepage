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

describe("widgets/sabnzbd/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "sabnzbd" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("sabnzbd.rate")).toBeInTheDocument();
    expect(screen.getByText("sabnzbd.queue")).toBeInTheDocument();
    expect(screen.getByText("sabnzbd.timeleft")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "sabnzbd" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders speed, queue count and time left when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { queue: { speed: "1.0 M", noofslots: 2, timeleft: "00:01:00" } },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "sabnzbd" } }} />, {
      settings: { hideErrors: false },
    });

    // fromUnits("1.0 M") => 1 * 1024**2
    expectBlockValue(container, "sabnzbd.rate", 1024 ** 2);
    expectBlockValue(container, "sabnzbd.queue", 2);
    expectBlockValue(container, "sabnzbd.timeleft", "00:01:00");
  });
});
