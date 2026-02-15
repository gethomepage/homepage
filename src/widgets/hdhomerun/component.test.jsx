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

describe("widgets/hdhomerun/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // lineup
      .mockReturnValueOnce({ data: undefined, error: undefined }); // status

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "hdhomerun", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("hdhomerun.channels")).toBeInTheDocument();
    expect(screen.getByText("hdhomerun.hd")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("caps widget.fields at 4 and filters blocks accordingly", () => {
    useWidgetAPI
      .mockReturnValueOnce({
        data: [{ HD: 1 }, { HD: 0 }, { HD: 1 }],
        error: undefined,
      })
      .mockReturnValueOnce({
        data: [
          { VctNumber: "5.1", VctName: "ABC", SignalStrengthPercent: 90 },
          { VctNumber: null, VctName: null, SignalStrengthPercent: null },
        ],
        error: undefined,
      });

    const service = {
      widget: {
        type: "hdhomerun",
        url: "http://x",
        fields: ["channels", "hd", "tunerCount", "channelNumber", "signalStrength"],
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["channels", "hd", "tunerCount", "channelNumber"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("hdhomerun.channels")).toBeInTheDocument();
    expect(screen.getByText("hdhomerun.hd")).toBeInTheDocument();
    expect(screen.getByText("hdhomerun.tunerCount")).toBeInTheDocument();
    expect(screen.getByText("hdhomerun.channelNumber")).toBeInTheDocument();
    expect(screen.queryByText("hdhomerun.signalStrength")).toBeNull();

    expectBlockValue(container, "hdhomerun.channels", 3);
    expectBlockValue(container, "hdhomerun.hd", 2);
    expectBlockValue(container, "hdhomerun.tunerCount", "1 / 2");
    expectBlockValue(container, "hdhomerun.channelNumber", "5.1");
  });
});
