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

describe("widgets/wallos/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields to 4 and filters loading placeholders accordingly", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "wallos" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual([
      "activeSubscriptions",
      "nextRenewingSubscription",
      "thisMonthlyCost",
      "nextMonthlyCost",
    ]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("wallos.activeSubscriptions")).toBeInTheDocument();
    expect(screen.getByText("wallos.nextRenewingSubscription")).toBeInTheDocument();
    expect(screen.getByText("wallos.thisMonthlyCost")).toBeInTheDocument();
    expect(screen.getByText("wallos.nextMonthlyCost")).toBeInTheDocument();
    expect(screen.queryByText("wallos.previousMonthlyCost")).toBeNull();
  });

  it("renders subscription and monthly cost values when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "get_subscriptions") return { data: { subscriptions: [{ name: "Sub" }] }, error: undefined };
      if (endpoint === "get_monthly_cost") return { data: { localized_monthly_cost: "$10" }, error: undefined };
      return { data: undefined, error: undefined };
    });

    const service = {
      widget: {
        type: "wallos",
        fields: ["activeSubscriptions", "nextRenewingSubscription", "thisMonthlyCost", "nextMonthlyCost"],
      },
    };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "wallos.activeSubscriptions", 1);
    expectBlockValue(container, "wallos.nextRenewingSubscription", "Sub");
    expectBlockValue(container, "wallos.thisMonthlyCost", "$10");
    expectBlockValue(container, "wallos.nextMonthlyCost", "$10");
  });
});
