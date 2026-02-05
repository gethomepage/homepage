// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./interface";

describe("widgets/openwrt/methods/interface", () => {
  it("returns null while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });
    const { container } = renderWithProviders(<Component service={{ widget: { type: "openwrt" } }} />);
    expect(container.firstChild).toBeNull();
  });

  it("renders status and byte counters when loaded", () => {
    useWidgetAPI.mockReturnValue({ data: { up: true, bytesTx: 100, bytesRx: 200 }, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "openwrt" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("widget.status")).toBeInTheDocument();
    expect(screen.getByText("openwrt.bytesTx")).toBeInTheDocument();
    expect(screen.getByText("openwrt.bytesRx")).toBeInTheDocument();

    // t("common.bytes") mock returns the numeric value as a string.
    expect(screen.getByText("100")).toBeInTheDocument();
    expect(screen.getByText("200")).toBeInTheDocument();
    expect(screen.getByText("openwrt.up")).toBeInTheDocument();
  });
});
