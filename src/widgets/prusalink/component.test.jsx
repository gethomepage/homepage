// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const service = { widget: { type: "prusalink" } };

describe("widgets/prusalink/component", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({});
    const { container } = renderWithProviders(<Component service={service} />);
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(useWidgetAPI).toHaveBeenCalledWith(service.widget, "status");
  });

  it("renders API errors", () => {
    useWidgetAPI.mockReturnValue({ error: { message: "Unauthorized" } });
    renderWithProviders(<Component service={service} />);
    expect(screen.getByText("Unauthorized")).toBeInTheDocument();
  });

  it.each([0, 42, 100])("renders printing telemetry at %s percent without rescaling", (progress) => {
    useWidgetAPI.mockReturnValue({
      data: { printer: { state: "PRINTING", temp_nozzle: 215, temp_bed: 60 }, job: { progress } },
    });
    const { container } = renderWithProviders(<Component service={service} />);
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expectBlockValue(container, "prusalink.state", "PRINTING");
    expectBlockValue(container, "prusalink.progress", progress);
  });

  it.each([0, 520, 7200])("renders remaining time of %s seconds", (remaining) => {
    useWidgetAPI.mockReturnValue({
      data: { printer: { state: "PRINTING" }, job: { time_remaining: remaining } },
    });
    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "prusalink", fields: ["time_left"] } }} />,
    );
    expect(container.querySelectorAll(".service-block")).toHaveLength(1);
    expectBlockValue(container, "prusalink.time_left", remaining);
  });

  it("handles idle printers with no job", () => {
    useWidgetAPI.mockReturnValue({ data: { printer: { state: "IDLE", temp_nozzle: 0, temp_bed: 0 } } });
    const { container } = renderWithProviders(<Component service={service} />);
    expectBlockValue(container, "prusalink.state", "IDLE");
    expectBlockValue(container, "prusalink.progress", "-");
    expectBlockValue(container, "prusalink.time_left", "-");
  });

  it("handles missing optional telemetry and field selection", () => {
    useWidgetAPI.mockReturnValue({ data: { printer: { state: "PAUSED" }, job: {} } });
    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "prusalink", fields: ["progress", "time_left"] } }} />,
    );
    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expectBlockValue(container, "prusalink.progress", "-");
    expectBlockValue(container, "prusalink.time_left", "-");
  });
});
