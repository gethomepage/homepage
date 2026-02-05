// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

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

describe("widgets/opnsense/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "opnsense" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("opnsense.cpu")).toBeInTheDocument();
    expect(screen.getByText("opnsense.memory")).toBeInTheDocument();
    expect(screen.getByText("opnsense.wanUpload")).toBeInTheDocument();
    expect(screen.getByText("opnsense.wanDownload")).toBeInTheDocument();
  });

  it("renders error UI when either endpoint errors", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "activity") return { data: undefined, error: { message: "nope" } };
      return { data: undefined, error: undefined };
    });

    renderWithProviders(<Component service={{ widget: { type: "opnsense" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("parses activity headers and renders WAN rx/tx for selected interface", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "activity") {
        return {
          data: {
            headers: ["", "", "CPU: 75.00% idle", "Mem: 123M Active, 456M Inact, 789M Wired"],
          },
          error: undefined,
        };
      }

      if (endpoint === "interface") {
        return {
          data: {
            interfaces: {
              wan2: { "bytes transmitted": 1000, "bytes received": 2000 },
              wan: { "bytes transmitted": 1, "bytes received": 2 },
            },
          },
          error: undefined,
        };
      }

      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "opnsense", wan: "wan2" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "opnsense.cpu", "25.00");
    expectBlockValue(container, "opnsense.memory", "123M");
    expectBlockValue(container, "opnsense.wanUpload", 1000);
    expectBlockValue(container, "opnsense.wanDownload", 2000);
  });
});
