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

describe("widgets/dispatcharr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "dispatcharr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("dispatcharr.channels")).toBeInTheDocument();
    expect(screen.getByText("dispatcharr.streams")).toBeInTheDocument();
  });

  it("renders counts and stream entries when enabled", () => {
    useWidgetAPI.mockReturnValueOnce({ data: [{}, {}, {}], error: undefined }).mockReturnValueOnce({
      data: {
        count: 1,
        channels: [{ stream_name: "Stream1", clients: [{}, {}], avg_bitrate: "1000kbps" }],
      },
      error: undefined,
    });

    const service = { widget: { type: "dispatcharr", enableActiveStreams: true } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "dispatcharr.channels", 3);
    expectBlockValue(container, "dispatcharr.streams", 1);
    expect(screen.getByText(/Stream1 - Clients: 2/)).toBeInTheDocument();
    expect(screen.getByText("1000kbps")).toBeInTheDocument();
  });
});
