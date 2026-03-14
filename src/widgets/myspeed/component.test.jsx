// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/myspeed/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "myspeed" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("myspeed.download")).toBeInTheDocument();
    expect(screen.getByText("myspeed.upload")).toBeInTheDocument();
    expect(screen.getByText("myspeed.ping")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "myspeed" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders download, upload and ping when loaded", () => {
    useWidgetAPI.mockReturnValue({ data: [{ download: 1, upload: 2, ping: 3 }], error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "myspeed" } }} />, {
      settings: { hideErrors: false },
    });

    // t("common.bitrate") returns the raw value from setup; widget multiplies by 1e6.
    expectBlockValue(container, "myspeed.download", 1000 * 1000);
    expectBlockValue(container, "myspeed.upload", 2 * 1000 * 1000);
    expectBlockValue(container, "myspeed.ping", 3);
  });
});
