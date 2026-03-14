// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/sparkyfitness/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls the stats endpoint and renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "sparkyfitness", url: "http://x" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(useWidgetAPI).toHaveBeenCalledWith(service.widget, "stats");
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("sparkyfitness.eaten")).toBeInTheDocument();
    expect(screen.getByText("sparkyfitness.burned")).toBeInTheDocument();
    expect(screen.getByText("sparkyfitness.remaining")).toBeInTheDocument();
    expect(screen.getByText("sparkyfitness.steps")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(4);
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "sparkyfitness", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders numeric values when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { eaten: 100, burned: 200, remaining: 300, steps: 400 },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "sparkyfitness", url: "http://x" } }} />,
      { settings: { hideErrors: false } },
    );

    expectBlockValue(container, "sparkyfitness.eaten", 100);
    expectBlockValue(container, "sparkyfitness.burned", 200);
    expectBlockValue(container, "sparkyfitness.remaining", 300);
    expectBlockValue(container, "sparkyfitness.steps", 400);
  });
});
