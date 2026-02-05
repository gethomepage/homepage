// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./downloader_get_downloadlist";

describe("widgets/openmediavault/methods/downloader_get_downloadlist", () => {
  it("renders '-' values when data is missing", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "openmediavault" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("openmediavault.downloading")).toBeInTheDocument();
    expect(screen.getByText("openmediavault.total")).toBeInTheDocument();
    expect(screen.getAllByText("-").length).toBeGreaterThan(0);
  });

  it("counts downloading and total items", () => {
    useWidgetAPI.mockReturnValue({
      data: { response: { data: [{ downloading: true }, { downloading: false }, { downloading: true }] } },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "openmediavault" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
