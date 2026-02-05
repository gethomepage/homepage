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

describe("widgets/proxmoxbackupserver/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // datastore
      .mockReturnValueOnce({ data: undefined, error: undefined }) // tasks
      .mockReturnValueOnce({ data: undefined, error: undefined }); // host

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
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: { message: "nope" } })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "proxmoxbackupserver" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders computed values and caps failed tasks at 99+", () => {
    useWidgetAPI
      .mockReturnValueOnce({
        data: {
          data: [
            { store: "ds1", used: 50, total: 100 },
            { store: "ds2", used: 25, total: 50 },
          ],
        },
        error: undefined,
      })
      .mockReturnValueOnce({ data: { total: 1000 }, error: undefined })
      .mockReturnValueOnce({ data: { data: { cpu: 0.2, memory: { used: 1, total: 4 } } }, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "proxmoxbackupserver", datastore: "ds2" } }} />, {
      settings: { hideErrors: false },
    });

    // datastore usage for ds2: 25/50*100 = 50
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("20")).toBeInTheDocument(); // cpu usage
    expect(screen.getByText("25")).toBeInTheDocument(); // memory usage
    expect(screen.getByText("99+")).toBeInTheDocument();
  });
});
