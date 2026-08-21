// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

const empty = { data: undefined, error: undefined };

// keyed by endpoint rather than call order, since the component renders more than once
function mockEndpoints(byEndpoint = {}) {
  useWidgetAPI.mockImplementation((widget, endpoint) => byEndpoint[endpoint] ?? empty);
}

describe("widgets/proxmoxbackupserver/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    mockEndpoints();

    const { container } = renderWithProviders(<Component service={{ widget: { type: "proxmoxbackupserver" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("proxmoxbackupserver.datastore_usage")).toBeInTheDocument();
    expect(screen.getByText("proxmoxbackupserver.failed_tasks_24h")).toBeInTheDocument();
    expect(screen.getByText("proxmoxbackupserver.cpu_usage")).toBeInTheDocument();
    expect(screen.getByText("proxmoxbackupserver.memory_usage")).toBeInTheDocument();
  });

  it("renders error UI when any endpoint errors", () => {
    mockEndpoints({ "nodes/localhost/tasks": { data: undefined, error: { message: "nope" } } });

    renderWithProviders(<Component service={{ widget: { type: "proxmoxbackupserver" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders computed values and caps failed tasks at 99+", () => {
    mockEndpoints({
      "status/datastore-usage": {
        data: {
          data: [
            { store: "ds1", used: 50, total: 100 },
            { store: "ds2", used: 25, total: 50 },
          ],
        },
        error: undefined,
      },
      "nodes/localhost/tasks": { data: { total: 1000 }, error: undefined },
      "nodes/localhost/status": { data: { data: { cpu: 0.2, memory: { used: 1, total: 4 } } }, error: undefined },
    });

    renderWithProviders(<Component service={{ widget: { type: "proxmoxbackupserver", datastore: "ds2" } }} />, {
      settings: { hideErrors: false },
    });

    // datastore usage for ds2: 25/50*100 = 50
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument(); // cpu usage
    expect(screen.getByText("25")).toBeInTheDocument(); // memory usage
    expect(screen.getByText("99+")).toBeInTheDocument();
  });

  it("requests failed tasks with a 24 hour since filter in epoch seconds", () => {
    vi.spyOn(Date, "now").mockReturnValue(1_776_519_498_000);

    mockEndpoints();

    renderWithProviders(<Component service={{ widget: { type: "proxmoxbackupserver" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenCalledWith(
      { type: "proxmoxbackupserver" },
      "nodes/localhost/tasks",
      {
        errors: true,
        limit: 100,
        since: 1_776_433_098,
      },
      { keepPreviousData: true },
    );
  });
});
