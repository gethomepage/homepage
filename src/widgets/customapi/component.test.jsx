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

  it("treats error payloads as data when a mapping targets the error field", () => {
    useWidgetAPI.mockReturnValue({
      data: { error: "rate limited" },
      error: { message: "ignored" },
    });

    renderWithProviders(
      <Component
        service={{
          widget: {
            type: "customapi",
            display: "list",
            mappings: [{ label: "Error", field: "error", format: "text" }],
          },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.queryByText("ignored")).toBeNull();
    expect(screen.getByText("rate limited")).toBeInTheDocument();
  });

  it("renders dynamic-list placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(
      <Component service={{ widget: { type: "customapi", display: "dynamic-list", mappings: {} } }} />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("renders dynamic-list errors when required mapping properties are missing", () => {
    useWidgetAPI.mockReturnValue({ data: { items: [] }, error: undefined });

    renderWithProviders(
      <Component
        service={{
          widget: {
            type: "customapi",
            display: "dynamic-list",
            mappings: { items: "items" },
          },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("Name and label properties are required")).toBeInTheDocument();
  });

  it("renders dynamic-list items with a target link and enforces the limit", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        items: [
          { id: "1", name: "First", value: 2 },
          { id: "2", name: "Second", value: 3 },
        ],
      },
      error: undefined,
    });

    renderWithProviders(
      <Component
        service={{
          widget: {
            type: "customapi",
            display: "dynamic-list",
            mappings: {
              items: "items",
              name: "name",
              label: "value",
              target: "https://example.com/items/{id}",
              limit: "1",
              prefix: "#",
              scale: "2/1",
              format: "number",
            },
          },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("First")).toBeInTheDocument();
    expect(screen.getByText("# 4")).toBeInTheDocument();
    expect(screen.queryByText("Second")).toBeNull();

    const link = screen.getByRole("link", { name: /First/i });
    expect(link).toHaveAttribute("href", "https://example.com/items/1");
  });

  it("supports legacy object field definitions and size formatting", () => {
    useWidgetAPI.mockReturnValue({
      data: { a: { b: { c: ["x", "y", "z"] } } },
      error: undefined,
    });

    renderWithProviders(
      <Component
        service={{
          widget: {
            type: "customapi",
            mappings: [
              {
                label: "Count",
                field: { a: { b: "c" } },
                format: "size",
                suffix: "items",
              },
            ],
          },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("Count")).toBeInTheDocument();
    expect(screen.getByText("3 items")).toBeInTheDocument();
  });
});
