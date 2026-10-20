// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const summary = {
  model_count: 540,
  collection_count: 12,
  category_count: 30,
  author_count: 85,
  recently_added: [{ id: "r1", name: "Benchy", view_count: 1, print_count: 0, created_at: "2026-10-19T10:00:00Z" }],
  top_viewed: [{ id: "v1", name: "Cable clip", view_count: 42, print_count: 3, created_at: "2026-01-01T00:00:00Z" }],
  top_printed: [{ id: "p1", name: "Hook", view_count: 7, print_count: 9, created_at: "2026-01-01T00:00:00Z" }],
};

function mockResponses(summaryResponse, featuredResponse = { data: undefined, error: undefined }) {
  useWidgetAPI.mockImplementation((widget, endpoint) => (endpoint === "featured" ? featuredResponse : summaryResponse));
}

describe("widgets/thingport/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    mockResponses({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "thingport", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("thingport.models")).toBeInTheDocument();
    expect(screen.getByText("thingport.authors")).toBeInTheDocument();
  });

  it("renders error UI when the summary errors", () => {
    mockResponses({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "thingport", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders library totals without listings by default", () => {
    mockResponses({ data: summary, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "thingport", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "thingport.models", 540);
    expectBlockValue(container, "thingport.collections", 12);
    expectBlockValue(container, "thingport.categories", 30);
    expectBlockValue(container, "thingport.authors", 85);
    expect(container.querySelectorAll("a")).toHaveLength(0);
    expect(useWidgetAPI).toHaveBeenCalledWith(expect.anything(), "", expect.anything());
  });

  it("lists the chosen models linked to the service href", () => {
    mockResponses({ data: summary, error: undefined });

    renderWithProviders(
      <Component
        service={{
          href: "https://thingport.example/",
          widget: { type: "thingport", url: "http://x", models: "printed" },
        }}
      />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("Hook").closest("a")).toHaveAttribute("href", "https://thingport.example/models/p1");
    expect(screen.getByText("9")).toBeInTheDocument();
    expect(screen.queryByText("Benchy")).not.toBeInTheDocument();
  });

  it("fetches the full list when more than three models are wanted", () => {
    const viewed = Array.from({ length: 12 }, (_, index) => ({
      id: `v${index}`,
      name: `Viewed ${index}`,
      view_count: 100 - index,
      print_count: 0,
      created_at: "2026-01-01T00:00:00Z",
    }));
    useWidgetAPI.mockImplementation((widget, endpoint) =>
      endpoint === "viewed" ? { data: viewed, error: undefined } : { data: summary, error: undefined },
    );

    renderWithProviders(
      <Component service={{ widget: { type: "thingport", url: "http://x", models: "viewed", maxModels: 20 } }} />,
      { settings: { hideErrors: false } },
    );

    expect(screen.getByText("Viewed 9")).toBeInTheDocument();
    expect(screen.queryByText("Viewed 10")).not.toBeInTheDocument();
  });

  it("asks Thingport for the newest models up to the limit", () => {
    mockResponses({ data: summary, error: undefined });

    renderWithProviders(
      <Component service={{ widget: { type: "thingport", url: "http://x", models: "recent", maxModels: 5 } }} />,
      { settings: { hideErrors: false } },
    );

    expect(useWidgetAPI).toHaveBeenCalledWith(expect.anything(), "recent", { orderBy: "newest", limit: 5 });
  });

  it("shows only the listing when blocks are disabled", () => {
    mockResponses({ data: summary, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "thingport", url: "http://x", models: "viewed", enableBlocks: false } }} />,
      { settings: { hideErrors: false } },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(0);
    expect(screen.getByText("Cable clip")).toBeInTheDocument();
  });

  it("shows the featured model with its author", () => {
    mockResponses(
      { data: summary, error: undefined },
      {
        data: { print: { id: "f1", name: "Planetary gear", author: { name: "Ada", handle: "ada" } } },
        error: undefined,
      },
    );

    renderWithProviders(<Component service={{ widget: { type: "thingport", url: "http://x", featured: true } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("Planetary gear").closest("a")).toHaveAttribute("href", "http://x/models/f1");
    expect(screen.getByText("Ada")).toBeInTheDocument();
    expect(useWidgetAPI).toHaveBeenCalledWith(
      expect.anything(),
      "featured",
      expect.objectContaining({ date: expect.stringMatching(/^\d{4}-\d{2}-\d{2}$/) }),
    );
  });
});
