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

describe("widgets/speedtest/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "speedtest" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("speedtest.download")).toBeInTheDocument();
    expect(screen.getByText("speedtest.upload")).toBeInTheDocument();
    expect(screen.getByText("speedtest.ping")).toBeInTheDocument();
  });

  it("renders values for version 2 endpoint (multiples by 8)", () => {
    useWidgetAPI.mockReturnValue({
      data: { data: { download: 10, upload: 20, ping: 3 } },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "speedtest", version: 2 } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "speedtest.download", 80);
    expectBlockValue(container, "speedtest.upload", 160);
    expectBlockValue(container, "speedtest.ping", 3);
  });
});
