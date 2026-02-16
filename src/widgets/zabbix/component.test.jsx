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

describe("widgets/zabbix/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields to 4 and filters placeholders accordingly", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "zabbix" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["warning", "average", "high", "disaster"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("zabbix.warning")).toBeInTheDocument();
    expect(screen.getByText("zabbix.average")).toBeInTheDocument();
    expect(screen.getByText("zabbix.high")).toBeInTheDocument();
    expect(screen.getByText("zabbix.disaster")).toBeInTheDocument();
    expect(screen.queryByText("zabbix.unclassified")).toBeNull();
    expect(screen.queryByText("zabbix.information")).toBeNull();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "zabbix" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("computes and renders priority counts for selected fields", () => {
    useWidgetAPI.mockReturnValue({
      data: [{ priority: "2" }, { priority: "3" }, { priority: "3" }, { priority: "5" }],
      error: undefined,
    });

    const service = { widget: { type: "zabbix" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // Default fields: warning/average/high/disaster
    expectBlockValue(container, "zabbix.warning", 1);
    expectBlockValue(container, "zabbix.average", 2);
    expectBlockValue(container, "zabbix.high", 0);
    expectBlockValue(container, "zabbix.disaster", 1);
  });
});
