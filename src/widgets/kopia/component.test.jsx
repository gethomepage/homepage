// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

function expectBlockMissing(container, label) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `expected no block for ${label}`).toBeFalsy();
}

describe("widgets/kopia/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders placeholders when status data is missing or source filter finds nothing", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "kopia", snapshotHost: "nope" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("kopia.status")).toBeInTheDocument();
    expect(screen.getByText("kopia.size")).toBeInTheDocument();
    expect(screen.getByText("kopia.lastrun")).toBeInTheDocument();
    expect(screen.getByText("kopia.nextrun")).toBeInTheDocument();
  });

  it("renders placeholders when sources exist but none match the filter", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        sources: [
          {
            source: { host: "hostA", path: "/data" },
            status: "OK",
            lastSnapshot: {
              startTime: "2019-12-31T22:00:00Z",
              stats: { errorCount: 0, totalSize: 1024 },
            },
            nextSnapshotTime: "2020-01-01T00:30:00Z",
          },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "kopia", snapshotHost: "nonexistent" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("kopia.status")).toBeInTheDocument();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "kopia" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders filtered snapshot status, size, and relative last/next run times", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        sources: [
          {
            source: { host: "hostA", path: "/data" },
            status: "OK",
            lastSnapshot: {
              startTime: "2019-12-31T22:00:00Z", // 2 hours ago
              stats: { errorCount: 0, totalSize: 1024 },
            },
            nextSnapshotTime: "2020-01-01T00:30:00Z", // 30 minutes ahead
          },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "kopia", snapshotHost: "hostA", snapshotPath: "/data" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "kopia.status", "OK");
    expectBlockValue(container, "kopia.size", 1024);
    expectBlockValue(container, "kopia.lastrun", "2 h");
    expectBlockValue(container, "kopia.nextrun", "30 m");
  });

  it("aggregates size across multiple matching sources", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        sources: [
          {
            source: { host: "hostA", path: "/data1" },
            status: "OK",
            lastSnapshot: {
              startTime: "2019-12-31T22:30:00Z", // 1.5 hours ago
              stats: { errorCount: 0, totalSize: 2048 },
            },
            nextSnapshotTime: "2020-01-01T02:00:00Z", // 2 hours ahead
          },
          {
            source: { host: "hostA", path: "/data2" },
            status: "OK",
            lastSnapshot: {
              startTime: "2019-12-31T22:00:00Z", // 2 hours ago
              stats: { errorCount: 0, totalSize: 4096 },
            },
            nextSnapshotTime: "2020-01-01T00:30:00Z", // 30 minutes ahead
          },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "kopia", snapshotHost: "hostA" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "kopia.status", "2 sources");
    expectBlockValue(container, "kopia.size", 6144);
    expectBlockValue(container, "kopia.lastrun", "1 h");
    expectBlockValue(container, "kopia.nextrun", "30 m");
  });

  it("renders first matching source without any filters", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        sources: [
          {
            source: { host: "hostA", path: "/data1" },
            status: "UPLOADING",
            lastSnapshot: {
              startTime: "2019-12-31T23:00:00Z", // 1 hour ago
              stats: { errorCount: 0, totalSize: 5000 },
            },
            nextSnapshotTime: "2020-01-01T01:00:00Z", // 1 hour ahead
          },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "kopia" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "kopia.status", "UPLOADING");
    expectBlockValue(container, "kopia.size", 5000);
    expectBlockValue(container, "kopia.lastrun", "1 h");
    expectBlockValue(container, "kopia.nextrun", "1 h");
  });

  it("filters by snapshotPath alone without snapshotHost", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        sources: [
          {
            source: { host: "hostA", path: "/skip" },
            status: "OK",
            lastSnapshot: {
              startTime: "2019-12-31T23:00:00Z",
              stats: { errorCount: 0, totalSize: 111 },
            },
            nextSnapshotTime: "2020-01-01T01:00:00Z",
          },
          {
            source: { host: "hostB", path: "/target" },
            status: "IDLE",
            lastSnapshot: {
              startTime: "2019-12-31T20:00:00Z", // 4 hours ago
              stats: { errorCount: 0, totalSize: 8192 },
            },
            nextSnapshotTime: "2020-01-01T03:00:00Z", // 3 hours ahead
          },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "kopia", snapshotPath: "/target" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "kopia.status", "IDLE");
    expectBlockValue(container, "kopia.size", 8192);
    expectBlockValue(container, "kopia.lastrun", "4 h");
    expectBlockValue(container, "kopia.nextrun", "3 h");
  });

  it("shows kopia.failed when all sources have errors", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        sources: [
          {
            source: { host: "hostA", path: "/data" },
            status: "ERROR",
            lastSnapshot: {
              startTime: "2019-12-31T22:00:00Z",
              stats: { errorCount: 5, totalSize: 2048 },
            },
            nextSnapshotTime: "2020-01-01T00:30:00Z",
          },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "kopia", snapshotHost: "hostA" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "kopia.status", "ERROR");
    expectBlockValue(container, "kopia.size", 2048);
    expectBlockValue(container, "kopia.lastrun", "kopia.failed");
  });

  it("uses only successful sources for lastRun in a mixed success/error set", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        sources: [
          {
            source: { host: "hostA", path: "/good" },
            status: "OK",
            lastSnapshot: {
              startTime: "2019-12-31T23:00:00Z", // 1 hour ago — successful
              stats: { errorCount: 0, totalSize: 1024 },
            },
            nextSnapshotTime: "2020-01-01T01:00:00Z",
          },
          {
            source: { host: "hostA", path: "/bad" },
            status: "ERROR",
            lastSnapshot: {
              startTime: "2019-12-31T23:55:00Z", // 5 min ago — but has errors
              stats: { errorCount: 3, totalSize: 512 },
            },
            nextSnapshotTime: "2020-01-01T00:10:00Z",
          },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "kopia", snapshotHost: "hostA" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "kopia.status", "2 sources");
    expectBlockValue(container, "kopia.size", 1536);
    // lastRun should be from the successful source (1 hour ago), not the failed one (5 min ago)
    expectBlockValue(container, "kopia.lastrun", "1 h");
    // nextrun should be the earliest: 10 minutes ahead
    expectBlockValue(container, "kopia.nextrun", "10 m");
  });

  it("does not render nextrun block when no sources have nextSnapshotTime", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        sources: [
          {
            source: { host: "hostA", path: "/data" },
            status: "OK",
            lastSnapshot: {
              startTime: "2019-12-31T23:30:00Z", // 30 minutes ago
              stats: { errorCount: 0, totalSize: 512 },
            },
            // no nextSnapshotTime
          },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "kopia", snapshotHost: "hostA" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "kopia.status", "OK");
    expectBlockValue(container, "kopia.lastrun", "30 m");
    expectBlockMissing(container, "kopia.nextrun");
  });

  describe("relativeDate formatting", () => {
    it("renders years for intervals > 1 year", () => {
      useWidgetAPI.mockReturnValue({
        data: {
          sources: [
            {
              source: { host: "h", path: "/" },
              status: "OK",
              lastSnapshot: {
                startTime: "2017-06-01T00:00:00Z", // ~2.5 years ago
                stats: { errorCount: 0, totalSize: 0 },
              },
              nextSnapshotTime: "2020-01-01T00:01:00Z",
            },
          ],
        },
        error: undefined,
      });

      const { container } = renderWithProviders(
        <Component service={{ widget: { type: "kopia" } }} />,
        { settings: { hideErrors: false } },
      );

      expectBlockValue(container, "kopia.lastrun", "2 y");
    });

    it("renders months for intervals > 1 month", () => {
      useWidgetAPI.mockReturnValue({
        data: {
          sources: [
            {
              source: { host: "h", path: "/" },
              status: "OK",
              lastSnapshot: {
                startTime: "2019-10-01T00:00:00Z", // ~3 months ago
                stats: { errorCount: 0, totalSize: 0 },
              },
              nextSnapshotTime: "2020-01-01T00:01:00Z",
            },
          ],
        },
        error: undefined,
      });

      const { container } = renderWithProviders(
        <Component service={{ widget: { type: "kopia" } }} />,
        { settings: { hideErrors: false } },
      );

      expectBlockValue(container, "kopia.lastrun", "3 mo");
    });

    it("renders days for intervals > 1 day", () => {
      useWidgetAPI.mockReturnValue({
        data: {
          sources: [
            {
              source: { host: "h", path: "/" },
              status: "OK",
              lastSnapshot: {
                startTime: "2019-12-28T00:00:00Z", // 4 days ago
                stats: { errorCount: 0, totalSize: 0 },
              },
              nextSnapshotTime: "2020-01-01T00:01:00Z",
            },
          ],
        },
        error: undefined,
      });

      const { container } = renderWithProviders(
        <Component service={{ widget: { type: "kopia" } }} />,
        { settings: { hideErrors: false } },
      );

      expectBlockValue(container, "kopia.lastrun", "4 d");
    });

    it("renders seconds for intervals < 1 minute", () => {
      useWidgetAPI.mockReturnValue({
        data: {
          sources: [
            {
              source: { host: "h", path: "/" },
              status: "OK",
              lastSnapshot: {
                startTime: "2019-12-31T23:59:45Z", // 15 seconds ago
                stats: { errorCount: 0, totalSize: 0 },
              },
              nextSnapshotTime: "2020-01-01T00:01:00Z",
            },
          ],
        },
        error: undefined,
      });

      const { container } = renderWithProviders(
        <Component service={{ widget: { type: "kopia" } }} />,
        { settings: { hideErrors: false } },
      );

      expectBlockValue(container, "kopia.lastrun", "15 s");
    });
  });
});
