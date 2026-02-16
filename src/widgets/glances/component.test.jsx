// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

vi.mock("./metrics/info", () => ({ default: () => <div>glances-info</div> }));
vi.mock("./metrics/memory", () => ({ default: () => <div>glances-memory</div> }));
vi.mock("./metrics/process", () => ({ default: () => <div>glances-process</div> }));
vi.mock("./metrics/containers", () => ({ default: () => <div>glances-containers</div> }));
vi.mock("./metrics/cpu", () => ({ default: () => <div>glances-cpu</div> }));
vi.mock("./metrics/net", () => ({ default: () => <div>glances-net</div> }));
vi.mock("./metrics/sensor", () => ({ default: () => <div>glances-sensor</div> }));
vi.mock("./metrics/disk", () => ({ default: () => <div>glances-disk</div> }));
vi.mock("./metrics/gpu", () => ({ default: () => <div>glances-gpu</div> }));
vi.mock("./metrics/fs", () => ({ default: () => <div>glances-fs</div> }));

import Component from "./component";

describe("widgets/glances/component", () => {
  it("routes metric=info to Info", () => {
    renderWithProviders(<Component service={{ widget: { type: "glances", metric: "info" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("glances-info")).toBeInTheDocument();
  });

  it("routes metric=cpu to Cpu", () => {
    renderWithProviders(<Component service={{ widget: { type: "glances", metric: "cpu" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("glances-cpu")).toBeInTheDocument();
  });

  it("routes metric patterns (network:, sensor:, disk:, gpu:, fs:) to their modules", () => {
    const { rerender } = renderWithProviders(
      <Component service={{ widget: { type: "glances", metric: "network:eth0" } }} />,
      {
        settings: { hideErrors: false },
      },
    );
    expect(screen.getByText("glances-net")).toBeInTheDocument();

    rerender(<Component service={{ widget: { type: "glances", metric: "sensor:temp" } }} />);
    expect(screen.getByText("glances-sensor")).toBeInTheDocument();

    rerender(<Component service={{ widget: { type: "glances", metric: "disk:sda" } }} />);
    expect(screen.getByText("glances-disk")).toBeInTheDocument();

    rerender(<Component service={{ widget: { type: "glances", metric: "gpu:nvidia" } }} />);
    expect(screen.getByText("glances-gpu")).toBeInTheDocument();

    rerender(<Component service={{ widget: { type: "glances", metric: "fs:/" } }} />);
    expect(screen.getByText("glances-fs")).toBeInTheDocument();
  });
});
