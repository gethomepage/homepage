// @vitest-environment jsdom

import { act, fireEvent, screen, waitFor } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useSWR } = vi.hoisted(() => ({ useSWR: vi.fn() }));

vi.mock("swr", () => ({
  default: useSWR,
}));

vi.mock("./resolvedicon", () => ({
  default: function ResolvedIconMock() {
    return <div data-testid="resolved-icon" />;
  },
}));

vi.mock("./widgets/search/search", () => ({
  getStoredProvider: () => null,
  searchProviders: {
    duckduckgo: {
      name: "DuckDuckGo",
      url: "https://duckduckgo.example/?q=",
      suggestionUrl: "https://duckduckgo.example/ac/?q=",
    },
  },
}));

import QuickLaunch from "./quicklaunch";

function Wrapper({ servicesAndBookmarks = [] } = {}) {
  const [searchString, setSearchString] = useState("");
  const [isOpen, setSearching] = useState(true);

  return (
    <QuickLaunch
      servicesAndBookmarks={servicesAndBookmarks}
      searchString={searchString}
      setSearchString={setSearchString}
      isOpen={isOpen}
      setSearching={setSearching}
    />
  );
}

describe("components/quicklaunch", () => {
  it("renders results for urls and opens the selected result on Enter", async () => {
    const openSpy = vi.spyOn(window, "open").mockImplementation(() => null);

    useSWR.mockReturnValue({ data: {}, error: undefined });

    renderWithProviders(<Wrapper />, {
      settings: {
        target: "_self",
        quicklaunch: {
          provider: "duckduckgo",
          showSearchSuggestions: false,
        },
      },
    });

    const input = screen.getByPlaceholderText("Search");
    await waitFor(() => expect(input).toHaveFocus());

    fireEvent.change(input, { target: { value: "example.com" } });

    expect(await screen.findByText("quicklaunch.visit URL")).toBeInTheDocument();
    expect(screen.getByText("DuckDuckGo quicklaunch.search")).toBeInTheDocument();

    fireEvent.keyDown(input, { key: "Enter" });

    await act(async () => {
      // Close/reset schedules timeouts (200ms + 300ms); flush them to avoid state updates after cleanup.
      await new Promise((r) => setTimeout(r, 350));
    });

    expect(openSpy).toHaveBeenCalledWith("https://example.com/", "_self", "noreferrer");

    openSpy.mockRestore();
  });
});
