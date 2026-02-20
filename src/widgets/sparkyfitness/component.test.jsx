// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/sparkyfitness/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "stats") return { data: undefined, error: undefined, isLoading: true };
      return { data: undefined, error: undefined, isLoading: false };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "sparkyfitness" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("sparkyfitness.eaten")).toBeInTheDocument();
    expect(screen.getByText("sparkyfitness.burned")).toBeInTheDocument();
    expect(screen.getByText("sparkyfitness.remaining")).toBeInTheDocument();
    expect(screen.getByText("sparkyfitness.steps")).toBeInTheDocument();
  });

  it("renders calorie stats when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "stats") {
        return {
          data: {
            eaten: 1500,
            burned: 500,
            remaining: 1000,
            goal: 2000,
            progress: 75,
            unit: "kcal",
            steps: 12345,
          },
          error: undefined,
          isLoading: false,
        };
      }
      return { data: undefined, error: undefined, isLoading: false };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "sparkyfitness" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "sparkyfitness.eaten", 1500);
    expectBlockValue(container, "sparkyfitness.burned", 500);
    expectBlockValue(container, "sparkyfitness.remaining", 1000);
    expectBlockValue(container, "sparkyfitness.steps", 12345);
  });
});
