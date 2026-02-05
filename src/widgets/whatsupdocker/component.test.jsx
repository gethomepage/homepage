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

describe("widgets/whatsupdocker/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "whatsupdocker" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("whatsupdocker.monitoring")).toBeInTheDocument();
    expect(screen.getByText("whatsupdocker.updates")).toBeInTheDocument();
  });

  it("renders monitoring and updates counts when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: [{ updateAvailable: true }, { updateAvailable: false }, { updateAvailable: true }],
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "whatsupdocker" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "whatsupdocker.monitoring", 3);
    expectBlockValue(container, "whatsupdocker.updates", 2);
  });
});
