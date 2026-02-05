// @vitest-environment jsdom

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { SettingsContext } from "utils/contexts/settings";
import { ThemeContext } from "utils/contexts/theme";

vi.mock("next/image", () => ({
  default: ({ src, alt }) => <div data-testid="next-image" data-src={src} data-alt={alt} />,
}));

import ResolvedIcon from "./resolvedicon";

function renderWithContexts(ui, { settings = {}, theme = "dark" } = {}) {
  return render(
    <SettingsContext.Provider value={{ settings, setSettings: () => {} }}>
      <ThemeContext.Provider value={{ theme, setTheme: vi.fn() }}>{ui}</ThemeContext.Provider>
    </SettingsContext.Provider>,
  );
}

describe("components/resolvedicon", () => {
  it("renders direct URL icons via next/image", () => {
    renderWithContexts(<ResolvedIcon icon="http://example.com/x.png" alt="x" />);
    expect(screen.getByTestId("next-image").getAttribute("data-src")).toBe("http://example.com/x.png");
  });

  it("renders relative URL icons via next/image", () => {
    renderWithContexts(<ResolvedIcon icon="/icons/x.png" alt="x" />);
    expect(screen.getByTestId("next-image").getAttribute("data-src")).toBe("/icons/x.png");
  });

  it("renders selfh.st icons for sh- prefix with extension", () => {
    renderWithContexts(<ResolvedIcon icon="sh-test.webp" alt="x" />);
    expect(screen.getByTestId("next-image").getAttribute("data-src")).toContain("/webp/test.webp");
  });

  it("renders selfh.st icons as svg or png based on file extension", () => {
    renderWithContexts(<ResolvedIcon icon="sh-test.svg" alt="x" />);
    expect(screen.getByTestId("next-image").getAttribute("data-src")).toContain("/svg/test.svg");

    renderWithContexts(<ResolvedIcon icon="sh-test.png" alt="x" />);
    expect(screen.getAllByTestId("next-image")[1].getAttribute("data-src")).toContain("/png/test.png");
  });

  it("renders mdi icons as a masked div and supports custom hex colors", () => {
    const { container } = renderWithContexts(<ResolvedIcon icon="mdi-home-#ff00ff" />, {
      settings: { iconStyle: "theme" },
      theme: "dark",
    });

    const div = container.querySelector("div");
    // Browser normalizes hex colors to rgb() strings on assignment.
    expect(div.style.background).toMatch(/(#ff00ff|rgb\(255, 0, 255\))/);
    expect(div.getAttribute("style")).toContain("home.svg");
  });

  it("renders si icons with a masked div using the configured icon style", () => {
    const { container } = renderWithContexts(<ResolvedIcon icon="si-github" />, {
      settings: { iconStyle: "gradient" },
      theme: "light",
    });

    const div = container.querySelector("div");
    expect(div.getAttribute("style")).toContain("github.svg");
    expect(div.style.background).toContain("linear-gradient");
  });

  it("falls back to dashboard-icons for .svg", () => {
    renderWithContexts(<ResolvedIcon icon="foo.svg" />);
    expect(screen.getByTestId("next-image").getAttribute("data-src")).toContain("/dashboard-icons/svg/foo.svg");
  });

  it("falls back to dashboard-icons for .webp and .png", () => {
    renderWithContexts(<ResolvedIcon icon="foo.webp" />);
    expect(screen.getAllByTestId("next-image")[0].getAttribute("data-src")).toContain("/dashboard-icons/webp/foo.webp");

    renderWithContexts(<ResolvedIcon icon="foo.png" />);
    expect(screen.getAllByTestId("next-image")[1].getAttribute("data-src")).toContain("/dashboard-icons/png/foo.png");
  });
});
