// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { ColorContext } from "utils/contexts/color";

import Favicon from "./favicon";

describe("components/favicon", () => {
  it("appends a shortcut icon link after rendering the SVG to canvas", async () => {
    const drawImage = vi.fn();
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({ drawImage });
    const toDataURLSpy = vi
      .spyOn(HTMLCanvasElement.prototype, "toDataURL")
      .mockReturnValue("data:image/x-icon;base64,AAA");

    const { container } = render(
      <ColorContext.Provider value={{ color: "slate", setColor: vi.fn() }}>
        <Favicon />
      </ColorContext.Provider>,
    );

    const img = container.querySelector("img");
    await waitFor(() => {
      expect(typeof img.onload).toBe("function");
    });

    img.onload();

    const link = document.head.querySelector('link[rel="shortcut icon"]');
    expect(link).not.toBeNull();
    expect(link.getAttribute("href")).toBe("data:image/x-icon;base64,AAA");
    expect(drawImage).toHaveBeenCalled();

    getContextSpy.mockRestore();
    toDataURLSpy.mockRestore();
  });
});
