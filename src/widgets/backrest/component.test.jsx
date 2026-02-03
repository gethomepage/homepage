// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

import Component from "./component";

describe("widgets/backrest/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults widget.fields and filters placeholders down to 4 blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "backrest" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual([
      "num_success_latest",
      "num_failure_latest",
      "num_failure_30",
      "bytes_added_30",
    ]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);

    expect(screen.getByText("backrest.num_success_latest")).toBeInTheDocument();
    expect(screen.getByText("backrest.num_failure_latest")).toBeInTheDocument();
    expect(screen.getByText("backrest.num_failure_30")).toBeInTheDocument();
    expect(screen.getByText("backrest.bytes_added_30")).toBeInTheDocument();
    expect(screen.queryByText("backrest.num_plans")).toBeNull();
  });

  it("truncates widget.fields to 4", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = {
      widget: { type: "backrest", fields: ["a", "b", "c", "d", "e"] },
    };

    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["a", "b", "c", "d"]);
  });

  it("renders values and respects field filtering", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        numPlans: 10,
        numSuccessLatest: 1,
        numFailureLatest: 2,
        numSuccess30Days: 3,
        numFailure30Days: 4,
        bytesAdded30Days: 500,
      },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "backrest" } }} />, {
      settings: { hideErrors: false },
    });

    // Default fields exclude num_plans and num_success_30
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.queryByText("backrest.num_plans")).toBeNull();
    expect(screen.queryByText("backrest.num_success_30")).toBeNull();

    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("500")).toBeInTheDocument();
  });
});
