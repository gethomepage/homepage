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

describe("widgets/qnap/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "qnap" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("qnap.cpuUsage")).toBeInTheDocument();
    expect(screen.getByText("qnap.memUsage")).toBeInTheDocument();
    expect(screen.getByText("qnap.systemTempC")).toBeInTheDocument();
    expect(screen.getByText("qnap.poolUsage")).toBeInTheDocument();
  });

  it("renders computed mem and pool usage for multi-volume payload", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        system: {
          cpu_usage: { _cdata: "50 %" },
          total_memory: { _cdata: 100 },
          free_memory: { _cdata: 25 },
          sys_tempc: { _text: 40 },
        },
        volume: {
          volumeUseList: { volumeUse: [{ total_size: { _cdata: "100" }, free_size: { _cdata: "50" } }] },
          volumeList: { volume: [{ volumeLabel: { _cdata: "DataVol1" } }] },
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "qnap" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "qnap.cpuUsage", "50");
    // mem% = ((100-25)/100)*100 = 75
    expectBlockValue(container, "qnap.memUsage", "75");
    // pool% = ((100-50)/100)*100 = 50
    expectBlockValue(container, "qnap.poolUsage", "50");
  });
});
