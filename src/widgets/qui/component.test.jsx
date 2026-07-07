// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

// Aggregated response (cross-instance) — no serverState, as qui can't merge it.
const aggregatedData = {
  stats: { downloading: 1, seeding: 2, totalDownloadSpeed: 100, totalUploadSpeed: 200, total: 10, error: 0 },
  counts: { status: { all: 10, completed: 8, errored: 3 } },
};

// Per-instance response — includes serverState (ratio / free space).
const perInstanceData = {
  stats: { downloading: 0, seeding: 3, totalDownloadSpeed: 0, totalUploadSpeed: 141939, total: 6477, error: 0 },
  counts: { status: { all: 6477, completed: 6477, errored: 0 } },
  serverState: { global_ratio: "8.58", free_space_on_disk: 49820224065536 },
};

describe("widgets/qui/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders four placeholder blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "qui" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("qui.leech")).toBeInTheDocument();
    expect(screen.getByText("qui.download")).toBeInTheDocument();
    expect(screen.getByText("qui.seed")).toBeInTheDocument();
    expect(screen.getByText("qui.upload")).toBeInTheDocument();
  });

  it("shows placeholders for selected optional fields while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "qui", instance: 1, fields: ["seed", "ratio"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // Container filters placeholders by fields, so an optional placeholder must exist to be shown.
    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("qui.seed")).toBeInTheDocument();
    expect(screen.getByText("qui.ratio")).toBeInTheDocument();
  });

  it("renders error UI when the endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "qui" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("uses the aggregated endpoint and shows active/total for seed and leech", () => {
    useWidgetAPI.mockReturnValue({ data: aggregatedData, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "qui" } }} />, {
      settings: { hideErrors: false },
    });

    // No instance id -> aggregated (cross-instance) mapping.
    expect(useWidgetAPI).toHaveBeenCalledWith(expect.anything(), "torrentsAll");

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "qui.leech", "1 / 2"); // active downloading / incomplete (all - completed)
    expectBlockValue(container, "qui.download", "100");
    expectBlockValue(container, "qui.seed", "2 / 8"); // active seeding / completed
    expectBlockValue(container, "qui.upload", "200");
  });

  it("uses the per-instance endpoint and renders serverState-backed ratio and freeSpace", () => {
    useWidgetAPI.mockReturnValue({ data: perInstanceData, error: undefined });

    const service = { widget: { type: "qui", instance: 1, fields: ["seed", "upload", "ratio", "freeSpace"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // Instance id set -> per-instance mapping.
    expect(useWidgetAPI).toHaveBeenCalledWith(expect.anything(), "torrents");

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "qui.seed", "3 / 6477");
    expectBlockValue(container, "qui.upload", "141939");
    expectBlockValue(container, "qui.ratio", "8.58");
    expectBlockValue(container, "qui.freeSpace", "49820224065536");
  });

  it("renders the optional total and errored fields when selected", () => {
    useWidgetAPI.mockReturnValue({ data: aggregatedData, error: undefined });

    const service = { widget: { type: "qui", fields: ["total", "errored"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expectBlockValue(container, "qui.total", "10");
    expectBlockValue(container, "qui.errored", "3");
  });

  it("omits ratio/freeSpace in aggregated mode where serverState is absent", () => {
    useWidgetAPI.mockReturnValue({ data: aggregatedData, error: undefined });

    const service = { widget: { type: "qui", fields: ["seed", "ratio", "freeSpace"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getByText("qui.seed")).toBeInTheDocument();
    expect(screen.queryByText("qui.ratio")).toBeNull();
    expect(screen.queryByText("qui.freeSpace")).toBeNull();
    expect(container.querySelectorAll(".service-block")).toHaveLength(1);
  });
});
