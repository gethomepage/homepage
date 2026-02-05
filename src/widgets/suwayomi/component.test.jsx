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

describe("widgets/suwayomi/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields while loading and renders placeholders", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "suwayomi" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["download", "nondownload", "read", "unread"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("suwayomi.download")).toBeInTheDocument();
    expect(screen.getByText("suwayomi.nondownload")).toBeInTheDocument();
    expect(screen.getByText("suwayomi.read")).toBeInTheDocument();
    expect(screen.getByText("suwayomi.unread")).toBeInTheDocument();
  });

  it("renders mapped label blocks when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        { label: "suwayomi.download", count: 1 },
        { label: "suwayomi.read", count: 2 },
      ],
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "suwayomi" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "suwayomi.download", 1);
    expectBlockValue(container, "suwayomi.read", 2);
  });
});
