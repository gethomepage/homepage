// @vitest-environment jsdom

import { fireEvent, screen } from "@testing-library/react";
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
});
