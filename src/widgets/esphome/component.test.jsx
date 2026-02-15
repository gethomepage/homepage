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

describe("widgets/esphome/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields and filters placeholders to 4 blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "esphome" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["online", "offline", "offline_alt", "total"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("esphome.online")).toBeInTheDocument();
    expect(screen.getByText("esphome.offline")).toBeInTheDocument();
    expect(screen.getByText("esphome.offline_alt")).toBeInTheDocument();
    expect(screen.getByText("esphome.total")).toBeInTheDocument();
    expect(screen.queryByText("esphome.unknown")).toBeNull();
  });

  it("computes online/offline/unknown and filters to default fields", () => {
    useWidgetAPI.mockReturnValue({
      data: { a: true, b: false, c: null },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "esphome" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "esphome.online", 1);
    expectBlockValue(container, "esphome.offline", 1);
    // offline_alt is count of not-true, i.e. false+null = 2
    expectBlockValue(container, "esphome.offline_alt", 2);
    expectBlockValue(container, "esphome.total", 3);
  });
});
