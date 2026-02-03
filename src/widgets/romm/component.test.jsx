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

describe("widgets/romm/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields to 4 and shows placeholders (container filters to selected fields)", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "romm" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["platforms", "totalRoms", "saves", "states"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("romm.platforms")).toBeInTheDocument();
    expect(screen.getByText("romm.totalRoms")).toBeInTheDocument();
    expect(screen.getByText("romm.saves")).toBeInTheDocument();
    expect(screen.getByText("romm.states")).toBeInTheDocument();
    expect(screen.queryByText("romm.screenshots")).toBeNull();
    expect(screen.queryByText("romm.totalfilesize")).toBeNull();
  });

  it("caps widget.fields at 4 entries", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "romm", fields: ["platforms", "totalRoms", "saves", "states", "screenshots"] } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["platforms", "totalRoms", "saves", "states"]);
  });

  it("renders values when loaded (and includes additional fields when explicitly selected)", () => {
    useWidgetAPI.mockReturnValue({
      data: { PLATFORMS: 1, ROMS: 2, SAVES: 3, STATES: 4, SCREENSHOTS: 5, FILESIZE: 6 },
      error: undefined,
    });

    const service = { widget: { type: "romm", fields: ["platforms", "totalRoms", "screenshots", "totalfilesize"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "romm.platforms", 1);
    expectBlockValue(container, "romm.totalRoms", 2);
    expectBlockValue(container, "romm.screenshots", 5);
    expectBlockValue(container, "romm.totalfilesize", 6);
  });
});
