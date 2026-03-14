// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component, { seerrDefaultFields } from "./component";

describe("widgets/seerr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields and filters to 3 blocks while loading when issues are not enabled", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // request/count
      .mockReturnValueOnce({ data: undefined, error: undefined }); // issue/count disabled (endpoint = "")

    const service = { widget: { type: "seerr", url: "http://x" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(seerrDefaultFields);
    expect(useWidgetAPI.mock.calls[1][1]).toBe("");
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("seerr.pending")).toBeInTheDocument();
    expect(screen.getByText("seerr.approved")).toBeInTheDocument();
    expect(screen.getByText("seerr.completed")).toBeInTheDocument();
    expect(screen.queryByText("seerr.available")).toBeNull();
    expect(screen.queryByText("seerr.processing")).toBeNull();
    expect(screen.queryByText("seerr.issues")).toBeNull();
  });

  it("supports jellyseerr as a legacy alias to seerr", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // request/count
      .mockReturnValueOnce({ data: undefined, error: undefined }); // issue/count disabled (endpoint = "")

    const service = { widget: { type: "jellyseerr", url: "http://x" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(seerrDefaultFields);
    expect(useWidgetAPI.mock.calls[1][1]).toBe("");
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("seerr.pending")).toBeInTheDocument();
    expect(screen.getByText("seerr.approved")).toBeInTheDocument();
    expect(screen.getByText("seerr.completed")).toBeInTheDocument();
  });

  it("supports overseerr as a legacy alias with the same default fields", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // request/count
      .mockReturnValueOnce({ data: undefined, error: undefined }); // issue/count disabled (endpoint = "")

    const service = { widget: { type: "overseerr", url: "http://x" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(seerrDefaultFields);
    expect(useWidgetAPI.mock.calls[1][1]).toBe("");
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("seerr.pending")).toBeInTheDocument();
    expect(screen.getByText("seerr.approved")).toBeInTheDocument();
    expect(screen.getByText("seerr.completed")).toBeInTheDocument();
  });

  it("keeps processing as a separate optional field", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { pending: 1, processing: 2, approved: 3, available: 4 }, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined }); // issue/count disabled (endpoint = "")

    const service = {
      widget: { type: "overseerr", url: "http://x", fields: ["pending", "processing", "approved", "available"] },
    };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(useWidgetAPI.mock.calls[1][1]).toBe("");
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("seerr.processing")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.queryByText("seerr.completed")).toBeNull();
  });

  it("renders issues when enabled (and calls the issue/count endpoint)", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { pending: 1, approved: 2, available: 3, completed: 4 }, error: undefined })
      .mockReturnValueOnce({ data: { open: 1, total: 2 }, error: undefined });

    const service = {
      widget: { type: "seerr", url: "http://x", fields: ["pending", "approved", "completed", "issues"] },
    };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(useWidgetAPI.mock.calls[1][1]).toBe("issue/count");
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("1 / 2")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("falls back from completed to available on older Seerr responses", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { pending: 1, approved: 2, available: 3 }, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    const service = {
      widget: { type: "seerr", url: "http://x", fields: ["pending", "approved", "completed"] },
    };

    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["pending", "approved", "available"]);
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.queryByText("seerr.completed")).toBeNull();
  });

  it("renders error UI when issues are enabled and issue/count errors", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { pending: 0, approved: 0, available: 0 }, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "seerr", url: "http://x", fields: ["issues"] } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });
});
