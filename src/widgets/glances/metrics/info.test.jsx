// @vitest-environment jsdom

import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./info";

describe("widgets/glances/metrics/info", () => {
  it("renders a placeholder while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });
    renderWithProviders(<Component service={{ widget: { chart: false, version: 3 } }} />, {
      settings: { hideErrors: false },
    });
    expect(document.querySelector(".service-container")).toBeTruthy();
  });
});
