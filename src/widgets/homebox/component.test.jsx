// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component, { homeboxDefaultFields } from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/homebox/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields and filters to 3 blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "homebox", url: "http://x" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(homeboxDefaultFields);
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("homebox.items")).toBeInTheDocument();
    expect(screen.getByText("homebox.locations")).toBeInTheDocument();
    expect(screen.getByText("homebox.totalValue")).toBeInTheDocument();
    expect(screen.queryByText("homebox.labels")).toBeNull();
    expect(screen.queryByText("homebox.users")).toBeNull();
    expect(screen.queryByText("homebox.totalWithWarranty")).toBeNull();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "homebox", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders values when loaded (currency formatting delegated to i18n)", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        items: 10,
        totalWithWarranty: 2,
        locations: 3,
        labels: 4,
        users: 5,
        totalValue: 123.45,
        currencyCode: "USD",
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "homebox", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expectBlockValue(container, "homebox.items", 10);
    expectBlockValue(container, "homebox.locations", 3);
    expectBlockValue(container, "homebox.totalValue", 123.45);
  });
});
