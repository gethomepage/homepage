// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

vi.mock("components/resolvedicon", () => ({
  default: ({ icon }) => <div data-testid="resolved-icon" data-icon={icon} />,
}));

import Item from "./item";

describe("components/bookmarks/item", () => {
  it("falls back description to href hostname and uses settings.target", () => {
    renderWithProviders(<Item bookmark={{ name: "A", href: "http://example.com/x", abbr: "A" }} iconOnly={false} />, {
      settings: { target: "_self", cardBlur: "" },
    });

    expect(screen.getByText("example.com")).toBeInTheDocument();
    expect(screen.getByRole("link").getAttribute("target")).toBe("_self");
  });

  it("applies hairline card styles when cardStyle is set", () => {
    renderWithProviders(<Item bookmark={{ name: "A", href: "http://example.com/x", abbr: "A" }} iconOnly={false} />, {
      settings: { cardStyle: "hairline" },
    });

    const className = screen.getByRole("link").className;
    expect(className).toContain("inset-ring");
    expect(className).not.toContain("shadow-md");
  });

  it("renders icon-only layout with icon when provided", () => {
    renderWithProviders(
      <Item bookmark={{ name: "A", href: "http://example.com/x", abbr: "A", icon: "mdi-home" }} iconOnly />,
      { settings: { target: "_self" } },
    );

    expect(screen.getByTestId("resolved-icon").getAttribute("data-icon")).toBe("mdi-home");
  });

  it("renders the non-icon-only layout with an icon when provided", () => {
    renderWithProviders(
      <Item bookmark={{ name: "A", href: "http://example.com/x", abbr: "A", icon: "mdi-home" }} iconOnly={false} />,
      { settings: { target: "_self", cardBlur: "" } },
    );

    expect(screen.getByTestId("resolved-icon").getAttribute("data-icon")).toBe("mdi-home");
  });
});
