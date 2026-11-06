// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

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

  it("shows the selected volume usage when volumeList and volumeUseList orders differ", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        system: {
          cpu_usage: { _cdata: "10 %" },
          total_memory: { _cdata: 100 },
          free_memory: { _cdata: 25 },
          sys_tempc: { _text: 40 },
        },
        volume: {
          volumeUseList: {
            volumeUse: [
              { volumeValue: { _cdata: 1 }, total_size: { _cdata: "4790" }, free_size: { _cdata: "1480" } },
              { volumeValue: { _cdata: 2 }, total_size: { _cdata: "740" }, free_size: { _cdata: "620" } },
            ],
          },
          volumeList: {
            volume: [
              { volumeValue: { _cdata: 2 }, volumeLabel: { _cdata: "Apps" } },
              { volumeValue: { _cdata: 1 }, volumeLabel: { _cdata: "FileStore" } },
            ],
          },
        },
      },
      error: undefined,
    });

    // FileStore is index 1 in volumeList but its usage is index 0 in volumeUseList
    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "qnap", volume: "FileStore" } }} />,
      { settings: { hideErrors: false } },
    );
    // volume% = ((4790-1480)/4790)*100 ≈ 69.1, rendered without decimals
    expectBlockValue(container, "qnap.volumeUsage", "69");

    useWidgetAPI.mockReturnValue({
      data: {
        system: {
          cpu_usage: { _cdata: "10 %" },
          total_memory: { _cdata: 100 },
          free_memory: { _cdata: 25 },
          sys_tempc: { _text: 40 },
        },
        volume: {
          volumeUseList: {
            volumeUse: [
              { volumeValue: { _cdata: 1 }, total_size: { _cdata: "4790" }, free_size: { _cdata: "1480" } },
              { volumeValue: { _cdata: 2 }, total_size: { _cdata: "740" }, free_size: { _cdata: "620" } },
            ],
          },
          volumeList: {
            volume: [
              { volumeValue: { _cdata: 2 }, volumeLabel: { _cdata: "Apps" } },
              { volumeValue: { _cdata: 1 }, volumeLabel: { _cdata: "FileStore" } },
            ],
          },
        },
      },
      error: undefined,
    });

    const second = renderWithProviders(<Component service={{ widget: { type: "qnap", volume: "Apps" } }} />, {
      settings: { hideErrors: false },
    });
    // volume% = ((740-620)/740)*100 ≈ 16.2, rendered without decimals
    expectBlockValue(second.container, "qnap.volumeUsage", "16");
  });

  it("treats a payload without volumeValue as an invalid volume", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        system: {
          cpu_usage: { _cdata: "10 %" },
          total_memory: { _cdata: 100 },
          free_memory: { _cdata: 25 },
          sys_tempc: { _text: 40 },
        },
        volume: {
          volumeUseList: {
            volumeUse: [{ total_size: { _cdata: "100" }, free_size: { _cdata: "50" } }],
          },
          volumeList: {
            volume: [{ volumeLabel: { _cdata: "DataVol1" } }],
          },
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "qnap", volume: "DataVol1" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.textContent).toContain("qnap.volumeUsage");
    expect(container.textContent).not.toContain("common.percent");
  });

  it("treats mismatched volumeValue presence as an invalid volume", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        system: {
          cpu_usage: { _cdata: "10 %" },
          total_memory: { _cdata: 100 },
          free_memory: { _cdata: 25 },
          sys_tempc: { _text: 40 },
        },
        volume: {
          volumeUseList: {
            volumeUse: [{ total_size: { _cdata: "100" }, free_size: { _cdata: "50" } }],
          },
          volumeList: {
            volume: [{ volumeValue: { _cdata: 1 }, volumeLabel: { _cdata: "DataVol1" } }],
          },
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "qnap", volume: "DataVol1" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.textContent).toContain("qnap.volumeUsage");
    expect(container.textContent).not.toContain("common.percent");
  });

  it("reports an invalid volume when the label is not found", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        system: {
          cpu_usage: { _cdata: "10 %" },
          total_memory: { _cdata: 100 },
          free_memory: { _cdata: 25 },
          sys_tempc: { _text: 40 },
        },
        volume: {
          volumeUseList: {
            volumeUse: [{ volumeValue: { _cdata: 1 }, total_size: { _cdata: "4790" }, free_size: { _cdata: "1480" } }],
          },
          volumeList: {
            volume: [{ volumeValue: { _cdata: 1 }, volumeLabel: { _cdata: "FileStore" } }],
          },
        },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "qnap", volume: "NoSuchVolume" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.textContent).toContain("qnap.volumeUsage");
    expect(container.textContent).not.toContain("common.percent");
  });
});
