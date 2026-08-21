// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/bookorbit/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "bookorbit" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("bookorbit.libraries")).toBeInTheDocument();
    expect(screen.getByText("bookorbit.books")).toBeInTheDocument();
    expect(screen.getByText("bookorbit.reading")).toBeInTheDocument();
    expect(screen.getByText("bookorbit.finished")).toBeInTheDocument();
  });

  it("renders values with nullish fallback defaults", () => {
    useWidgetAPI.mockReturnValue({
      data: { libraries: 3, books: 2, finished: 4 }, // reading missing -> 0
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "bookorbit" } }} />, { settings: { hideErrors: false } });

    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("0")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("names the count block for the media kind and drops the library count", () => {
    useWidgetAPI.mockReturnValue({
      data: { libraries: 1, books: 12, reading: 0, finished: 0, mediaKind: "comic" },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "bookorbit", libraries: ["Magazines"] } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("bookorbit.comics")).toBeInTheDocument();
    expect(screen.queryByText("bookorbit.books")).not.toBeInTheDocument();
    expect(screen.queryByText("bookorbit.libraries")).not.toBeInTheDocument();
  });

  it("keeps the library count when several libraries are selected", () => {
    useWidgetAPI.mockReturnValue({
      data: { libraries: 2, books: 12, reading: 0, finished: 0 },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "bookorbit", libraries: "Comics, Magazines" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("bookorbit.libraries")).toBeInTheDocument();
    expect(screen.getByText("bookorbit.books")).toBeInTheDocument();
  });

  it("drops the library count while loading a single-library widget", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "bookorbit", libraries: ["Comics"] } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.queryByText("bookorbit.libraries")).not.toBeInTheDocument();
  });
  it("words a combined audiobook selection as listening", () => {
    useWidgetAPI.mockReturnValue({
      data: { libraries: 1, books: 20, reading: 2, finished: 0, mediaKind: "audiobook" },
      error: undefined,
    });

    renderWithProviders(<Component service={{ widget: { type: "bookorbit", libraries: ["Audiobooks"] } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("bookorbit.listening")).toBeInTheDocument();
    expect(screen.getByText("bookorbit.audiobooks")).toBeInTheDocument();
    expect(screen.queryByText("bookorbit.reading")).not.toBeInTheDocument();
  });
});
