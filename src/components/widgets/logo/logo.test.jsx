// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

vi.mock("components/resolvedicon", () => ({
  default: ({ icon }) => <div data-testid="resolved-icon" data-icon={icon} />,
}));

import Logo from "./logo";

describe("components/widgets/logo", () => {
  it("renders a fallback SVG when no icon is configured", () => {
    const { container } = renderWithProviders(<Logo options={{}} />, { settings: { target: "_self" } });
    expect(screen.queryByTestId("resolved-icon")).toBeNull();
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("renders the configured icon via ResolvedIcon", () => {
    renderWithProviders(<Logo options={{ icon: "mdi:home" }} />, { settings: { target: "_self" } });
    const icon = screen.getByTestId("resolved-icon");
    expect(icon.getAttribute("data-icon")).toBe("mdi:home");
  });
});
