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
});
