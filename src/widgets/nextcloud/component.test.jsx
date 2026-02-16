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

describe("widgets/nextcloud/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders default placeholders (no cpu/memory blocks when fields are unset)", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "nextcloud" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.queryByText("nextcloud.cpuload")).toBeNull();
    expect(screen.queryByText("nextcloud.memoryusage")).toBeNull();
    expect(screen.getByText("nextcloud.freespace")).toBeInTheDocument();
    expect(screen.getByText("nextcloud.activeusers")).toBeInTheDocument();
    expect(screen.getByText("nextcloud.numfiles")).toBeInTheDocument();
    expect(screen.getByText("nextcloud.numshares")).toBeInTheDocument();
  });

  it("respects widget.fields and renders computed values", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        ocs: {
          data: {
            nextcloud: {
              system: {
                cpuload: [0.5],
                mem_total: "100",
                mem_free: "50",
                freespace: 1024,
              },
              storage: { num_files: 1 },
              shares: { num_shares: 2 },
            },
            activeUsers: { last24hours: 3 },
          },
        },
      },
      error: undefined,
    });

    // 4 fields triggers the legacy behavior where CPU + memory are shown;
    // Container then filters to exactly these fields.
    const service = {
      widget: { type: "nextcloud", fields: ["cpuload", "memoryusage", "freespace", "activeusers"] },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("nextcloud.cpuload")).toBeInTheDocument();
    expect(screen.getByText("nextcloud.memoryusage")).toBeInTheDocument();
    expect(screen.getByText("nextcloud.freespace")).toBeInTheDocument();
    expect(screen.getByText("nextcloud.activeusers")).toBeInTheDocument();
    expect(screen.queryByText("nextcloud.numfiles")).toBeNull();
    expect(screen.queryByText("nextcloud.numshares")).toBeNull();

    // Values: cpu load 0.5, memory usage 50, freespace 1024, active users 3.
    expect(screen.getByText("0.5")).toBeInTheDocument();
    expect(screen.getByText("50")).toBeInTheDocument();
    expect(screen.getByText("1024")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });
});
