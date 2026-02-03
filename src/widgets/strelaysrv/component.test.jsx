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

describe("widgets/strelaysrv/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "strelaysrv" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("strelaysrv.numActiveSessions")).toBeInTheDocument();
    expect(screen.getByText("strelaysrv.numConnections")).toBeInTheDocument();
    expect(screen.getByText("strelaysrv.bytesProxied")).toBeInTheDocument();
  });

  it("renders metrics when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { numActiveSessions: 1, numConnections: 2, bytesProxied: 3, kbps10s1m5m15m30m60m: [0, 0, 0, 0, 0, 123] },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "strelaysrv" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "strelaysrv.numActiveSessions", 1);
    expectBlockValue(container, "strelaysrv.numConnections", 2);
    expectBlockValue(container, "strelaysrv.dataRelayed", 3);
    expectBlockValue(container, "strelaysrv.transferRate", 123);
  });
});
