// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/duplicati/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders default placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "duplicati" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("duplicati.jobs")).toBeInTheDocument();
    expect(screen.getByText("duplicati.errors")).toBeInTheDocument();
    expect(screen.getByText("duplicati.lastBackup")).toBeInTheDocument();
    expect(screen.getByText("duplicati.nextRun")).toBeInTheDocument();
  });

  it("uses the standard widget API hook without custom refresh settings", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "duplicati" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenCalledWith(expect.objectContaining({ type: "duplicati" }));
  });

  it("renders summary values", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        jobs: 2,
        stored: 2048,
        lastBackup: "2026-07-12T11:00:00Z",
        nextRun: "2026-07-13T11:00:00Z",
        running: 1,
        warnings: 0,
        errors: 1,
      },
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "duplicati", fields: ["jobs", "running", "errors"] } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expectBlockValue(container, "duplicati.jobs", 2);
    expectBlockValue(container, "duplicati.running", 1);
    expectBlockValue(container, "duplicati.errors", 1);
  });

  it("renders the error state", () => {
    useWidgetAPI.mockReturnValue({
      data: undefined,
      error: "boom",
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "duplicati" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.textContent).toContain("boom");
  });
});
