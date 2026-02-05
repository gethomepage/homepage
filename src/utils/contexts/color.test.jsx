// @vitest-environment jsdom

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { useContext } from "react";
import { describe, expect, it } from "vitest";

import { ColorContext, ColorProvider } from "./color";

function Reader() {
  const { color, setColor } = useContext(ColorContext);
  return (
    <div>
      <div data-testid="value">{color}</div>
      <button type="button" onClick={() => setColor("red")}>
        red
      </button>
    </div>
  );
}

describe("utils/contexts/color", () => {
  it("initializes from localStorage and writes theme class + storage on updates", async () => {
    localStorage.setItem("theme-color", "blue");
    document.documentElement.className = "";

    render(
      <ColorProvider>
        <Reader />
      </ColorProvider>,
    );

    expect(screen.getByTestId("value")).toHaveTextContent("blue");
    await waitFor(() => expect(document.documentElement.classList.contains("theme-blue")).toBe(true));

    fireEvent.click(screen.getByRole("button", { name: "red" }));
    await waitFor(() => expect(document.documentElement.classList.contains("theme-red")).toBe(true));
    expect(localStorage.getItem("theme-color")).toBe("red");
  });

  it("defaults to slate when localStorage is empty", async () => {
    localStorage.removeItem("theme-color");
    document.documentElement.className = "";

    render(
      <ColorProvider>
        <Reader />
      </ColorProvider>,
    );

    expect(screen.getByTestId("value")).toHaveTextContent("slate");
    await waitFor(() => expect(document.documentElement.classList.contains("theme-slate")).toBe(true));
  });
});
