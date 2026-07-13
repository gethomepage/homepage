// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/syncthing/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "syncthing" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("syncthing.connected")).toBeInTheDocument();
    expect(screen.getByText("syncthing.synced")).toBeInTheDocument();
    expect(screen.getByText("syncthing.storage")).toBeInTheDocument();
    expect(screen.getByText("syncthing.errors")).toBeInTheDocument();
  });

  it("renders metrics when loaded", () => {
    useWidgetAPI
      .mockReturnValueOnce({
        data: {
          connections: {
            "test-1": { connected: true },
            "test-2": { connected: false },
          },
        },
        error: undefined,
      })
      .mockReturnValueOnce({
        data: {
          completion: 75,
          globalBytes: 1_234_567,
        },
        error: undefined,
      })
      .mockReturnValueOnce({
        data: {
          errors: ["err 1", "err 2"],
        },
        error: undefined,
      });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "syncthing" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "syncthing.connected", 1);
    expectBlockValue(container, "syncthing.synced", 75);
    expectBlockValue(container, "syncthing.errors", 2);
    expectBlockValue(container, "syncthing.storage", "1234567");
  });

  it.each(["connections", "completion", "error"])("renders errors from the %s endpoint", (endpoint) => {
    useWidgetAPI.mockImplementation((_widget, requestedEndpoint) => ({
      data: undefined,
      error: requestedEndpoint === endpoint ? `${endpoint} failed` : undefined,
    }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "syncthing" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.textContent).toContain(`${endpoint} failed`);
  });

  it("renders zero when there are no errors", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { connections: {} }, error: undefined })
      .mockReturnValueOnce({ data: { completion: 100, globalBytes: 0 }, error: undefined })
      .mockReturnValueOnce({ data: {}, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "syncthing" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "syncthing.errors", 0);
  });
});
