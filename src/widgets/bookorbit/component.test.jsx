// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const data = { books: 1200, authors: 300, series: 45, storage: 1024, reading: 2, finished: 80 };

describe("widgets/bookorbit/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders default placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "bookorbit" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("bookorbit.books")).toBeInTheDocument();
    expect(screen.getByText("bookorbit.authors")).toBeInTheDocument();
    expect(screen.getByText("bookorbit.reading")).toBeInTheDocument();
    expect(screen.getByText("bookorbit.finished")).toBeInTheDocument();
  });

  it("renders error UI when the endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "bookorbit" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
  });

  it("renders the default fields", () => {
    useWidgetAPI.mockReturnValue({ data, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "bookorbit" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "bookorbit.books", 1200);
    expectBlockValue(container, "bookorbit.authors", 300);
    expectBlockValue(container, "bookorbit.reading", 2);
    expectBlockValue(container, "bookorbit.finished", 80);
  });

  it("renders configured fields", () => {
    useWidgetAPI.mockReturnValue({ data, error: undefined });

    const service = { widget: { type: "bookorbit", fields: ["series", "storage"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expectBlockValue(container, "bookorbit.series", 45);
    expectBlockValue(container, "bookorbit.storage", 1024);
  });
});
