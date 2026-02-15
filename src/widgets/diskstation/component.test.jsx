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

describe("widgets/diskstation/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "diskstation" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("diskstation.uptime")).toBeInTheDocument();
    expect(screen.getByText("diskstation.volumeAvailable")).toBeInTheDocument();
    expect(screen.getByText("resources.cpu")).toBeInTheDocument();
    expect(screen.getByText("resources.mem")).toBeInTheDocument();
  });

  it("computes uptime days, volume free bytes, and CPU/memory usage", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { data: { up_time: "48:00:00" } }, error: undefined })
      .mockReturnValueOnce({
        data: { data: { vol_info: [{ name: "vol1", used_size: "20", total_size: "100" }] } },
        error: undefined,
      })
      .mockReturnValueOnce({
        data: { data: { cpu: { user_load: "10", system_load: "5" }, memory: { real_usage: "25" } } },
        error: undefined,
      });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "diskstation", volume: "vol1" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "diskstation.uptime", "2 diskstation.days");
    expectBlockValue(container, "diskstation.volumeAvailable", 80);
    expectBlockValue(container, "resources.cpu", 15);
    expectBlockValue(container, "resources.mem", 25);
  });
});
