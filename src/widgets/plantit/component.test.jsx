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

describe("widgets/plantit/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "plantit" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("plantit.events")).toBeInTheDocument();
    expect(screen.getByText("plantit.plants")).toBeInTheDocument();
    expect(screen.getByText("plantit.photos")).toBeInTheDocument();
    expect(screen.getByText("plantit.species")).toBeInTheDocument();
  });

  it("renders error UI when endpoint errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "plantit" } }} />, { settings: { hideErrors: false } });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders counts when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: { diaryEntryCount: 1, plantCount: 2, imageCount: 3, botanicalInfoCount: 4 },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "plantit" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "plantit.events", 1);
    expectBlockValue(container, "plantit.plants", 2);
    expectBlockValue(container, "plantit.photos", 3);
    expectBlockValue(container, "plantit.species", 4);
  });
});
