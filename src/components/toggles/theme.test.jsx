// @vitest-environment jsdom

import { fireEvent, render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ThemeContext } from "utils/contexts/theme";

import ThemeToggle from "./theme";

describe("components/toggles/theme", () => {
  it("renders nothing when theme is missing", () => {
    const { container } = render(
      <ThemeContext.Provider value={{ theme: null, setTheme: vi.fn() }}>
        <ThemeToggle />
      </ThemeContext.Provider>,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("toggles from dark to light when clicked", () => {
    const setTheme = vi.fn();
    render(
      <ThemeContext.Provider value={{ theme: "dark", setTheme }}>
        <ThemeToggle />
      </ThemeContext.Provider>,
    );

    // The toggle is a clickable icon rendered as an svg (react-icons).
    const toggles = document.querySelectorAll("svg");
    fireEvent.click(toggles[1]);
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("toggles from light to dark when clicked", () => {
    const setTheme = vi.fn();
    render(
      <ThemeContext.Provider value={{ theme: "light", setTheme }}>
        <ThemeToggle />
      </ThemeContext.Provider>,
    );

    const toggles = document.querySelectorAll("svg");
    fireEvent.click(toggles[1]);
    expect(setTheme).toHaveBeenCalledWith("dark");
  });
});
