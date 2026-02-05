// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component, { technitiumDefaultFields } from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/technitium/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields to 4 and filters loading placeholders accordingly", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "technitium" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(technitiumDefaultFields);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("technitium.totalQueries")).toBeInTheDocument();
    expect(screen.getByText("technitium.totalAuthoritative")).toBeInTheDocument();
    expect(screen.getByText("technitium.totalCached")).toBeInTheDocument();
    expect(screen.getByText("technitium.totalServerFailure")).toBeInTheDocument();
    expect(screen.queryByText("technitium.totalNoError")).toBeNull();
  });

  it("renders selected totals with percentages when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        totalQueries: 100,
        totalNoError: 50,
        totalServerFailure: 25,
        totalNxDomain: 25,
      },
      error: undefined,
    });

    const service = {
      widget: { type: "technitium", fields: ["totalQueries", "totalNoError", "totalServerFailure", "totalNxDomain"] },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "technitium.totalQueries", 100);
    expectBlockValue(container, "technitium.totalNoError", "50");
    expectBlockValue(container, "technitium.totalNoError", "50");
    expectBlockValue(container, "technitium.totalServerFailure", "25");
    expectBlockValue(container, "technitium.totalNxDomain", "25");
    // Percent strings are included in parens, e.g. "50 (50)"
    expect(findServiceBlockByLabel(container, "technitium.totalNoError")?.textContent).toContain("(");
  });
});
