// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));

vi.mock("swr", () => ({ default: useSWR }));
vi.mock("components/resolvedicon", () => ({
  default: ({ icon }) => <div data-testid="resolved-icon" data-icon={icon} />,
}));

import CustomAPI from "./customapi";

const mappings = [
  { field: "data.result.0.value.1", label: "CPU", format: "float", suffix: "°C" },
  { field: "data.result.1.value.1", label: "GPU", format: "float", suffix: "°C" },
];

describe("components/widgets/customapi", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders an error state when SWR errors", () => {
    useSWR.mockReturnValue({ data: undefined, error: new Error("nope") });

    renderWithProviders(<CustomAPI options={{ index: 0, mappings }} />);

    expect(screen.getByText("widget.api_error")).toBeInTheDocument();
  });

  it("renders an error state when the API returns an error", () => {
    useSWR.mockReturnValue({ data: { error: "Missing Custom API URL" }, error: undefined });

    renderWithProviders(<CustomAPI options={{ index: 0, mappings }} />);

    expect(screen.getByText("widget.api_error")).toBeInTheDocument();
  });

  it("renders placeholders for each mapping while loading", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<CustomAPI options={{ index: 0, mappings }} />);

    expect(screen.getByText("CPU")).toBeInTheDocument();
    expect(screen.getByText("GPU")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(2);
  });

  it("renders mapped, formatted values", () => {
    useSWR.mockReturnValue({
      data: {
        data: {
          result: [{ value: [1750000000, "60.6"] }, { value: [1750000000, "48.2"] }],
        },
      },
      error: undefined,
    });

    renderWithProviders(<CustomAPI options={{ index: 0, mappings, label: "MBP" }} />);

    expect(screen.getByText("60.6 °C")).toBeInTheDocument();
    expect(screen.getByText("48.2 °C")).toBeInTheDocument();
    expect(screen.getByText("MBP")).toBeInTheDocument();
  });

  it("requests its own widget index and honours refreshInterval with a 1s floor", () => {
    useSWR.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<CustomAPI options={{ index: 2, mappings, refreshInterval: 10 }} />);

    expect(useSWR).toHaveBeenCalledWith("/api/widgets/customapi?index=2", { refreshInterval: 1000 });
  });

  it("renders a mapping icon through ResolvedIcon and none when no icon is set", () => {
    useSWR.mockReturnValue({ data: { data: { result: [{ value: [0, "60.6"] }, { value: [0, "48.2"] }] } } });

    renderWithProviders(
      <CustomAPI options={{ index: 0, mappings: [{ ...mappings[0], icon: "mdi-thermometer" }, mappings[1]] }} />,
    );

    const icons = screen.getAllByTestId("resolved-icon");
    expect(icons).toHaveLength(1);
    expect(icons[0].getAttribute("data-icon")).toBe("mdi-thermometer");
  });

  it("renders nothing for a non-array mappings value instead of throwing", () => {
    useSWR.mockReturnValue({ data: { ok: true } });

    const { container } = renderWithProviders(<CustomAPI options={{ index: 0, mappings: { field: "ok" } }} />);

    expect(container.querySelectorAll(".information-widget-resource")).toHaveLength(0);
  });
});
