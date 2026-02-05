// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { ColorContext } from "utils/contexts/color";

import Favicon from "./favicon";

describe("components/favicon", () => {
  beforeEach(() => {
    document.head.querySelectorAll('link[rel="shortcut icon"]').forEach((el) => el.remove());
  });

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

  it("returns early when refs are missing (defensive guard)", async () => {
    vi.resetModules();
    vi.doMock("react", async () => {
      const actual = await vi.importActual("react");
      return {
        ...actual,
        // Run the effect immediately to hit the defensive guard before refs are attached.
        useEffect: (fn) => fn(),
      };
    });

    const { ColorContext: TestColorContext } = await import("utils/contexts/color");
    const { default: FaviconWithMissingRefs } = await import("./favicon");

    const { container } = render(
      <TestColorContext.Provider value={{ color: "slate", setColor: vi.fn() }}>
        <FaviconWithMissingRefs />
      </TestColorContext.Provider>,
    );

    // Allow effects to flush; the guard should prevent the icon link from being appended.
    await waitFor(() => {
      expect(container.querySelector("img")).toBeTruthy();
    });

    expect(document.head.querySelector('link[rel="shortcut icon"]')).toBeNull();

    vi.unmock("react");
    vi.resetModules();
  });
});
