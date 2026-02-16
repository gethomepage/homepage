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

describe("widgets/beszel/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading (systems view)", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "beszel" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["systems", "up"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("beszel.systems")).toBeInTheDocument();
    expect(screen.getByText("beszel.up")).toBeInTheDocument();
  });

  it("renders system totals when loaded (systems view)", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        totalItems: 3,
        items: [{ status: "up" }, { status: "down" }, { status: "up" }],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "beszel" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "beszel.systems", 3);
    expectBlockValue(container, "beszel.up", "2 / 3");
  });

  it("renders selected system details and filters to 4 default fields", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        totalItems: 1,
        items: [
          {
            id: "sys1",
            name: "MySystem",
            status: "up",
            updated: 123,
            info: { cpu: 10, mp: 20, dp: 30, b: 40 },
          },
        ],
      },
      error: undefined,
    });

    const service = { widget: { type: "beszel", systemId: "sys1" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["name", "status", "cpu", "memory"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);

    expectBlockValue(container, "beszel.name", "MySystem");
    expectBlockValue(container, "beszel.status", "beszel.up");
    expectBlockValue(container, "beszel.cpu", 10);
    expectBlockValue(container, "beszel.memory", 20);
    expect(screen.queryByText("beszel.updated")).toBeNull();
  });

  it("renders error when systemId is not found", () => {
    useWidgetAPI.mockReturnValue({
      data: { totalItems: 1, items: [{ id: "sys1", name: "MySystem", status: "up", info: {} }] },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "beszel", systemId: "missing" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("System with id missing not found")).toBeInTheDocument();
  });
});
