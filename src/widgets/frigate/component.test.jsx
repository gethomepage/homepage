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

describe("widgets/frigate/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // stats
      .mockReturnValueOnce({ data: undefined, error: undefined }); // events

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "frigate", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("frigate.cameras")).toBeInTheDocument();
    expect(screen.getByText("frigate.uptime")).toBeInTheDocument();
    expect(screen.getByText("frigate.version")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(3);
  });

  it("renders error UI when either endpoint errors", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: { message: "nope" } })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "frigate", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders stats and recent events when enabled", () => {
    useWidgetAPI
      .mockReturnValueOnce({
        data: { num_cameras: 2, uptime: 3600, version: "1.0.0" },
        error: undefined,
      })
      .mockReturnValueOnce({
        data: [{ id: "e1", camera: "Cam1", label: "Person", score: 0.5, start_time: 123 }],
        error: undefined,
      });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "frigate", url: "http://x", enableRecentEvents: true } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "frigate.cameras", 2);
    expectBlockValue(container, "frigate.uptime", 3600);
    expectBlockValue(container, "frigate.version", "1.0.0");

    // The event text is composed of multiple text nodes; match on the element's full textContent.
    expect(
      screen.getByText((_, el) => el?.classList?.contains("absolute") && el.textContent?.includes("Cam1 (Person 50)")),
    ).toBeInTheDocument();
    expect(screen.getByText("123")).toBeInTheDocument();
  });
});
