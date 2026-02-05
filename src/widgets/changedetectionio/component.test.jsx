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

describe("widgets/changedetectionio/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "changedetectionio" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("changedetectionio.diffsDetected")).toBeInTheDocument();
    expect(screen.getByText("changedetectionio.totalObserved")).toBeInTheDocument();
  });

  it("computes diffs detected (last_changed > 0 and not viewed)", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        a: { last_changed: 1, viewed: false },
        b: { last_changed: 0, viewed: false },
        c: { last_changed: 2, viewed: true },
        d: { last_changed: 3, viewed: false },
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "changedetectionio" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "changedetectionio.totalObserved", 4);
    expectBlockValue(container, "changedetectionio.diffsDetected", 2);
  });
});
