// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/prowlarr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "prowlarr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("prowlarr.numberOfGrabs")).toBeInTheDocument();
    expect(screen.getByText("prowlarr.numberOfQueries")).toBeInTheDocument();
    expect(screen.getByText("prowlarr.numberOfFailGrabs")).toBeInTheDocument();
    expect(screen.getByText("prowlarr.numberOfFailQueries")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "prowlarr" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("sums grabs/queries and failed counts across indexers", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        indexers: [
          { numberOfGrabs: 1, numberOfQueries: 2, numberOfFailedGrabs: 3, numberOfFailedQueries: 4 },
          { numberOfGrabs: 10, numberOfQueries: 20, numberOfFailedGrabs: 30, numberOfFailedQueries: 40 },
        ],
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "prowlarr" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "prowlarr.numberOfGrabs", 11);
    expectBlockValue(container, "prowlarr.numberOfQueries", 22);
    expectBlockValue(container, "prowlarr.numberOfFailGrabs", 33);
    expectBlockValue(container, "prowlarr.numberOfFailQueries", 44);
  });
});
