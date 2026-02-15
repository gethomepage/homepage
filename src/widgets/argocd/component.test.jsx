// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const blocks = Array.from(container.querySelectorAll(".service-block"));
  const block = blocks.find((b) => b.textContent?.includes(label));
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/argocd/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults and truncates widget.fields to 4 and renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "argocd", fields: ["apps", "synced", "outOfSync", "healthy", "extra"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["apps", "synced", "outOfSync", "healthy"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("argocd.apps")).toBeInTheDocument();
    expect(screen.getByText("argocd.synced")).toBeInTheDocument();
    expect(screen.getByText("argocd.outOfSync")).toBeInTheDocument();
    expect(screen.getByText("argocd.healthy")).toBeInTheDocument();
  });

  it("renders counts when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        items: [
          { status: { sync: { status: "Synced" }, health: { status: "Healthy" } } },
          { status: { sync: { status: "OutOfSync" }, health: { status: "Degraded" } } },
          { status: { sync: { status: "Synced" }, health: { status: "Healthy" } } },
        ],
      },
      error: undefined,
    });

    const service = { widget: { type: "argocd" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // Default widget fields: apps/synced/outOfSync/healthy => all 4 should be visible.
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);

    expectBlockValue(container, "argocd.apps", 3);
    expectBlockValue(container, "argocd.synced", 2);
    expectBlockValue(container, "argocd.outOfSync", 1);
    expectBlockValue(container, "argocd.healthy", 2);
  });
});
