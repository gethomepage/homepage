// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/customapi/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholder blocks for the first 4 mappings while loading (block display)", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = {
      widget: {
        type: "customapi",
        mappings: [{ label: "a" }, { label: "b" }, { label: "c" }, { label: "d" }, { label: "e" }],
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("a")).toBeInTheDocument();
    expect(screen.getByText("b")).toBeInTheDocument();
    expect(screen.getByText("c")).toBeInTheDocument();
    expect(screen.getByText("d")).toBeInTheDocument();
    expect(screen.queryByText("e")).toBeNull();
  });

  it("renders list display, including additionalField and adaptive color", () => {
    useWidgetAPI.mockReturnValue({
      data: { foo: { bar: 10 }, delta: -1 },
      error: undefined,
    });

    const service = {
      widget: {
        type: "customapi",
        display: "list",
        mappings: [
          {
            label: "Value",
            field: "foo.bar",
            format: "number",
            prefix: "$",
            additionalField: { field: "delta", color: "adaptive" },
          },
        ],
      },
    };

    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getByText("Value")).toBeInTheDocument();
    expect(screen.getByText("$ 10")).toBeInTheDocument();

    const delta = screen.getByText("-1");
    expect(delta.className).toContain("text-rose-300");
  });

  it("shows error UI when widget API errors and mappings do not treat error as data", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(
      <Component service={{ widget: { type: "customapi", mappings: [{ label: "x", field: "x" }] } }} />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("nope")).toBeInTheDocument();
  });
});
