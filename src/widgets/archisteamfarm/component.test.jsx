// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/archisteamfarm/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "archisteamfarm" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("archisteamfarm.bots")).toBeInTheDocument();
    expect(screen.getByText("archisteamfarm.version")).toBeInTheDocument();
    expect(screen.getByText("archisteamfarm.memory")).toBeInTheDocument();
    expect(screen.getByText("archisteamfarm.uptime")).toBeInTheDocument();
  });

  it("renders ASF stats when loaded", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-25T16:19:32.210Z"));

    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "bots") {
        return { data: { count: 3 }, error: undefined };
      }

      if (endpoint === "stats") {
        return {
          data: {
            version: "6.3.4.2",
            memoryKiB: 24865,
            processStartTime: "2026-04-25T15:19:32.210Z",
          },
          error: undefined,
        };
      }

      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "archisteamfarm" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "archisteamfarm.bots", "3");
    expectBlockValue(container, "archisteamfarm.version", "v6.3.4.2");
    expectBlockValue(container, "archisteamfarm.memory", String(24865 * 1024));
    expectBlockValue(container, "archisteamfarm.uptime", "3600");
  });

  it("honors selected fields", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-25T16:19:32.210Z"));

    useWidgetAPI.mockImplementation((widget, endpoint) => {
      if (endpoint === "bots") {
        return { data: { count: 3 }, error: undefined };
      }

      if (endpoint === "stats") {
        return {
          data: {
            version: "6.3.4.2",
            memoryKiB: 24865,
            processStartTime: "2026-04-25T15:19:32.210Z",
          },
          error: undefined,
        };
      }

      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "archisteamfarm", fields: ["bots", "memory"] } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("archisteamfarm.bots")).toBeInTheDocument();
    expect(screen.getByText("archisteamfarm.memory")).toBeInTheDocument();
    expect(screen.queryByText("archisteamfarm.version")).not.toBeInTheDocument();
    expect(screen.queryByText("archisteamfarm.uptime")).not.toBeInTheDocument();
  });
});
