// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const items = [
  {
    title: "With image",
    link: "https://example.com/1",
    date: "2020-01-01T00:00:00Z",
    image: "https://example.com/1.jpg",
  },
  { title: "No link", link: null, date: null },
];

function render(widget = {}, settings = {}) {
  return renderWithProviders(<Component service={{ widget: { type: "feed", ...widget } }} />, {
    settings: { hideErrors: false, ...settings },
  });
}

describe("widgets/feed/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });
    const { container } = render();
    expect(container.querySelectorAll(".animate-pulse")).toHaveLength(3);
  });

  it("renders an error", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "Invalid feed" } });
    render();
    expect(screen.getAllByText(/Invalid feed/).length).toBeGreaterThan(0);
  });

  it("renders an empty feed", () => {
    useWidgetAPI.mockReturnValue({ data: { items: [] }, error: undefined });
    render();
    expect(screen.getByText("feed.noItems")).toBeInTheDocument();
  });

  it("renders list items with links and images", () => {
    useWidgetAPI.mockReturnValue({ data: { items }, error: undefined });
    const { container } = render({}, { target: "_self" });

    const link = screen.getByText("With image").closest("a");
    expect(link).toHaveAttribute("href", "https://example.com/1");
    expect(link).toHaveAttribute("target", "_self");
    expect(link.querySelector("img")).toHaveAttribute("src", "https://example.com/1.jpg");
    expect(screen.getByText("No link").closest("a")).toBeNull();
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("renders the grid layout with image placeholders", () => {
    useWidgetAPI.mockReturnValue({ data: { items }, error: undefined });
    const { container } = render({ layout: "grid" });

    expect(container.querySelector(".grid")).not.toBeNull();
    expect(container.querySelectorAll(".aspect-video")).toHaveLength(2);
    expect(container.querySelectorAll("img")).toHaveLength(1);
  });

  it("hides images that fail to load", () => {
    useWidgetAPI.mockReturnValue({ data: { items }, error: undefined });
    const { container } = render();
    const img = container.querySelector("img");
    img.dispatchEvent(new Event("error"));
    expect(img.style.visibility).toBe("hidden");
  });
});
