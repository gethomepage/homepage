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

describe("widgets/pfsense/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders only optional blocks when widget.fields filters to wanIP + disk", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "pfsense", fields: ["wanIP", "disk"] } }} />,
      { settings: { hideErrors: false } },
    );

    // Container filters children based on widget.fields.
    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.queryByText("pfsense.load")).toBeNull();
    expect(screen.queryByText("pfsense.memory")).toBeNull();
    expect(screen.queryByText("pfsense.temp")).toBeNull();
    expect(screen.queryByText("pfsense.wanStatus")).toBeNull();
    expect(screen.getByText("pfsense.wanIP")).toBeInTheDocument();
    expect(screen.getByText("pfsense.disk")).toBeInTheDocument();
  });

  it("renders values for version 2 (systemv2/interfacev2)", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "systemv2") {
        return {
          data: {
            data: {
              cpu_load_avg: [0.5],
              mem_usage: 12.3456,
              disk_usage: 78.9,
              temp_c: 40,
            },
          },
          error: undefined,
        };
      }
      if (endpoint === "interfacev2") {
        return { data: { data: [{ hwif: "wan0", status: "up", ipaddr: "1.2.3.4" }] }, error: undefined };
      }
      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "pfsense", version: 2, wan: "wan0" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "pfsense.load", "0.5");
    expectBlockValue(container, "pfsense.memory", "12.35");
    expectBlockValue(container, "pfsense.temp", "40");
    expectBlockValue(container, "pfsense.wanStatus", "pfsense.up");
    expect(findServiceBlockByLabel(container, "pfsense.wanIP")).toBeUndefined();
    expect(findServiceBlockByLabel(container, "pfsense.disk")).toBeUndefined();
  });
});
