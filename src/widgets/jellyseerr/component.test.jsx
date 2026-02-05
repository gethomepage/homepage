// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component, { jellyseerrDefaultFields } from "./component";

describe("widgets/jellyseerr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields and filters to 3 blocks while loading when issues are not enabled", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // request/count
      .mockReturnValueOnce({ data: undefined, error: undefined }); // issue/count disabled (endpoint = "")

    const service = { widget: { type: "jellyseerr", url: "http://x" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(jellyseerrDefaultFields);
    expect(useWidgetAPI.mock.calls[1][1]).toBe("");
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("jellyseerr.pending")).toBeInTheDocument();
    expect(screen.getByText("jellyseerr.approved")).toBeInTheDocument();
    expect(screen.getByText("jellyseerr.available")).toBeInTheDocument();
    expect(screen.queryByText("jellyseerr.issues")).toBeNull();
  });

  it("renders issues when enabled (and calls the issue/count endpoint)", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { pending: 1, approved: 2, available: 3 }, error: undefined })
      .mockReturnValueOnce({ data: { open: 1, total: 2 }, error: undefined });

    const service = {
      widget: { type: "jellyseerr", url: "http://x", fields: ["pending", "approved", "available", "issues"] },
    };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(useWidgetAPI.mock.calls[1][1]).toBe("issue/count");
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
  });

  it("renders error UI when issues are enabled and issue/count errors", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { pending: 0, approved: 0, available: 0 }, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: { message: "nope" } });

    renderWithProviders(
      <Component service={{ widget: { type: "jellyseerr", url: "http://x", fields: ["issues"] } }} />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });
});
