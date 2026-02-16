// @vitest-environment jsdom

import { fireEvent, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

// HeadlessUI is hard to test reliably; stub the primitives to simple pass-through components.
vi.mock("@headlessui/react", async () => {
  const React = await import("react");
  const { Fragment, createContext, useContext } = React;
  const ListboxContext = createContext(null);

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
    Listbox: ({ value, onChange, children, ...props }) => (
      <ListboxContext.Provider value={{ value, onChange }}>
        <div {...props}>{typeof children === "function" ? children({}) : children}</div>
      </ListboxContext.Provider>
    ),
    ListboxButton: (props) => <button type="button" {...props} />,
    ListboxOption: ({ as: _as, value, children, ...props }) => {
      const ctx = useContext(ListboxContext);
      const content = typeof children === "function" ? children({ active: false }) : children;
      return (
        <div
          role="option"
          data-provider={value?.name}
          aria-selected={ctx?.value === value}
          onClick={() => ctx?.onChange?.(value)}
          {...props}
        >
          {content}
        </div>
      );
    },
    ListboxOptions: passthrough,
    Transition: ({ children }) => <>{children}</>,
  };
});

import Search from "./search";

describe("components/widgets/search", () => {
  beforeEach(() => {
    localStorage.clear();
  });

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

  it("accepts provider configured as a string", () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    renderWithProviders(
      <Search options={{ provider: "duckduckgo", showSearchSuggestions: false, target: "_self" }} />,
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

  it("returns null when the configured provider list contains no supported providers", () => {
    const { container } = renderWithProviders(<Search options={{ provider: "nope", showSearchSuggestions: false }} />, {
      settings: {},
    });

    expect(container).toBeEmptyDOMElement();
  });

  it("stores the selected provider in localStorage when it is changed", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    renderWithProviders(
      <Search options={{ provider: ["google", "duckduckgo"], showSearchSuggestions: false, target: "_self" }} />,
      {
        settings: {},
      },
    );

    const option = document.querySelector('[data-provider="DuckDuckGo"]');
    expect(option).not.toBeNull();
    fireEvent.click(option);

    await waitFor(() => {
      expect(localStorage.getItem("search-name")).toBe("DuckDuckGo");
    });

    const input = screen.getByPlaceholderText("search.placeholder");
    fireEvent.change(input, { target: { value: "hello" } });
    fireEvent.keyDown(input, { key: "Enter" });

    expect(openSpy).toHaveBeenCalledWith("https://duckduckgo.com/?q=hello", "_self");
    openSpy.mockRestore();
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
      json: async () => ["hel", ["hello", "help", "helm", "helium", "held"]],
    }));

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
    expect(document.querySelector('[value="held"]')).toBeNull();
    fireEvent.mouseDown(document.querySelector('[value="hello"]'));

    expect(openSpy).toHaveBeenCalledWith("https://www.google.com/search?q=hello", "_self");

    openSpy.mockRestore();

    fetch = originalFetch;
  });
});
