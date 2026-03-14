// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/checkmk/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls both endpoints with the expected query params and renders placeholders while loading", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "checkmk" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenNthCalledWith(
      1,
      expect.any(Object),
      "services_info",
      expect.objectContaining({
        columns: "state",
        query: '{"op": "!=", "left": "state", "right": "0"}',
      }),
    );
    expect(useWidgetAPI).toHaveBeenNthCalledWith(
      2,
      expect.any(Object),
      "hosts_info",
      expect.objectContaining({
        columns: "state",
        query: '{"op": "!=", "left": "state", "right": "0"}',
      }),
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("checkmk.serviceErrors")).toBeInTheDocument();
    expect(screen.getByText("checkmk.hostErrors")).toBeInTheDocument();
  });

  it("renders counts when loaded", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { value: [{}, {}] }, error: undefined })
      .mockReturnValueOnce({ data: { value: [{}] }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "checkmk" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "checkmk.serviceErrors", 2);
    expectBlockValue(container, "checkmk.hostErrors", 1);
  });
});
