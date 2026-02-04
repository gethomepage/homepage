// @vitest-environment jsdom

import { fireEvent, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

// HeadlessUI is hard to test reliably; stub the primitives to simple pass-through components.
vi.mock("@headlessui/react", async () => {
  const React = await import("react");
  const { Fragment } = React;

  function passthrough({ as: As = "div", children, ...props }) {
    if (As === Fragment) return <>{typeof children === "function" ? children({ active: false }) : children}</>;
    const content = typeof children === "function" ? children({ active: false }) : children;
    return <As {...props}>{content}</As>;
  }

  return {
    Combobox: passthrough,
    ComboboxInput: (props) => <input {...props} />,
    ComboboxOption: passthrough,
    ComboboxOptions: passthrough,
    Listbox: passthrough,
    ListboxButton: (props) => <button type="button" {...props} />,
    ListboxOption: passthrough,
    ListboxOptions: passthrough,
    Transition: ({ children }) => <>{children}</>,
  };
});

import Search from "./search";

describe("components/widgets/search", () => {
  it("opens a search URL when Enter is pressed", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    renderWithProviders(<Search options={{ provider: ["google"], showSearchSuggestions: false, target: "_self" }} />, {
      settings: { target: "_blank" },
    });

    const input = screen.getByPlaceholderText("search.placeholder");
    fireEvent.change(input, { target: { value: "hello world" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(openSpy).toHaveBeenCalledWith("https://www.google.com/search?q=hello%20world", "_self");
    openSpy.mockRestore();
  });

  it("returns null when the configured provider list contains no supported providers", () => {
    const { container } = renderWithProviders(<Search options={{ provider: "nope", showSearchSuggestions: false }} />, {
      settings: {},
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("uses a stored provider from localStorage when it is available and allowed", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    localStorage.setItem("search-name", "DuckDuckGo");

    renderWithProviders(
      <Search options={{ provider: ["google", "duckduckgo"], showSearchSuggestions: false, target: "_self" }} />,
      {
        settings: {},
      },
    );

    const input = screen.getByPlaceholderText("search.placeholder");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(openSpy).toHaveBeenCalledWith("https://duckduckgo.com/?q=hello", "_self");
    openSpy.mockRestore();
  });

  it("uses a custom provider URL when the selected provider is custom", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    renderWithProviders(
      <Search
        options={{
          provider: ["custom"],
          url: "https://example.com/search?q=",
          showSearchSuggestions: false,
          target: "_self",
        }}
      />,
      { settings: {} },
    );

    const input = screen.getByPlaceholderText("search.placeholder");
    fireEvent.change(input, { target: { value: "hello world" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(openSpy).toHaveBeenCalledWith("https://example.com/search?q=hello%20world", "_self");
    openSpy.mockRestore();
  });

  it("fetches search suggestions and triggers a search when a suggestion is selected", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    const originalFetch = globalThis.fetch;
    const fetchSpy = vi.fn(async () => ({
      json: async () => ["hel", ["hello", "help"]],
    }));
    // eslint-disable-next-line no-global-assign
    fetch = fetchSpy;

    renderWithProviders(<Search options={{ provider: ["google"], showSearchSuggestions: true, target: "_self" }} />, {
      settings: {},
    });

    const input = screen.getByPlaceholderText("search.placeholder");
    fireEvent.change(input, { target: { value: "hel" } });

    await waitFor(() => {
      expect(fetchSpy).toHaveBeenCalledWith(
        expect.stringContaining("/api/search/searchSuggestion?query=hel&providerName=Google"),
        expect.objectContaining({ signal: expect.any(AbortSignal) }),
      );
    });

    await waitFor(() => {
      expect(document.querySelector('[value="hello"]')).toBeTruthy();
    });
    fireEvent.mouseDown(document.querySelector('[value="hello"]'));

    expect(openSpy).toHaveBeenCalledWith("https://www.google.com/search?q=hello", "_self");

    openSpy.mockRestore();
    // eslint-disable-next-line no-global-assign
    fetch = originalFetch;
  });
});
