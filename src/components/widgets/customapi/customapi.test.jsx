// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));
vi.mock("swr", () => ({ default: useSWR }));

vi.mock("components/resolvedicon", () => ({
  default: ({ icon }) => <div data-testid="resolved-icon" data-icon={icon} />,
}));

import CustomApi from "./customapi";

const mappings = [
  { field: "count", label: "Count" },
  { field: "nested.name", label: "Name" },
];

describe("components/widgets/customapi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the route by widget index with a minimum refresh interval", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<CustomApi options={{ index: 2, mappings, refreshInterval: 10 }} />, {
      settings: { target: "_self" },
    });

    expect(useSWR).toHaveBeenCalledWith("/api/widgets/customapi?index=2", { refreshInterval: 1000 });
  });

  it("renders labels with placeholders while loading", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<CustomApi options={{ index: 0, mappings }} />, { settings: { target: "_self" } });

    expect(screen.getByText("Count")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("renders mapped values and the configured icon", () => {
    useSWR.mockReturnValue({ data: { count: 5, nested: { name: "foo" } }, error: undefined });

    renderWithProviders(<CustomApi options={{ index: 0, icon: "mdi-api", mappings }} />, {
      settings: { target: "_self" },
    });

    expect(screen.getByTestId("resolved-icon")).toHaveAttribute("data-icon", "mdi-api");
    expect(screen.getByText("5")).toBeInTheDocument();
    expect(screen.getByText("foo")).toBeInTheDocument();
  });

  it("renders the widget label when configured", () => {
    useSWR.mockReturnValue({ data: { count: 5 }, error: undefined });

    renderWithProviders(<CustomApi options={{ index: 0, label: "My API", mappings }} />, {
      settings: { target: "_self" },
    });

    expect(screen.getByText("My API")).toHaveClass("information-widget-label");
  });

  it("falls back to a default icon when none is configured", () => {
    useSWR.mockReturnValue({ data: { count: 5 }, error: undefined });

    const { container } = renderWithProviders(<CustomApi options={{ index: 0, mappings }} />, {
      settings: { target: "_self" },
    });

    expect(screen.queryByTestId("resolved-icon")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders an error widget when the route returns an error", () => {
    useSWR.mockReturnValue({ data: { error: { message: "HTTP Error" } }, error: undefined });

    renderWithProviders(<CustomApi options={{ index: 0, mappings }} />, { settings: { target: "_self" } });

    expect(screen.getByText("widget.api_error")).toBeInTheDocument();
  });

  it("treats an error key as data when a mapping reads it", () => {
    useSWR.mockReturnValue({ data: { error: "none" }, error: undefined });

    renderWithProviders(<CustomApi options={{ index: 0, mappings: [{ field: "error", label: "Error" }] }} />, {
      settings: { target: "_self" },
    });

    expect(screen.queryByText("widget.api_error")).toBeNull();
    expect(screen.getByText("none")).toBeInTheDocument();
  });
});
