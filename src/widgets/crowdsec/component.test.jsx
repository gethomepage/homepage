// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/crowdsec/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("requests the alerts and bans endpoints", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    renderWithProviders(<Component service={{ widget: { type: "crowdsec" } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenNthCalledWith(1, expect.any(Object), "alerts");
    expect(useWidgetAPI).toHaveBeenNthCalledWith(2, expect.any(Object), "bans");
  });

  it("ignores the deprecated limit24h option", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    renderWithProviders(<Component service={{ widget: { type: "crowdsec", limit24h: true } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenNthCalledWith(1, expect.any(Object), "alerts");
  });

  it("renders placeholders when both alerts and bans are missing", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "crowdsec" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("crowdsec.alerts")).toBeInTheDocument();
    expect(screen.getByText("crowdsec.bans")).toBeInTheDocument();
  });

  it("renders 0-length arrays as 0 counts", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: [], error: undefined })
      .mockReturnValueOnce({ data: [], error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "crowdsec" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "crowdsec.alerts", 0);
    expectBlockValue(container, "crowdsec.bans", 0);
  });

  it("marks the alert count as truncated at the API limit", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: new Array(500).fill({}), error: undefined })
      .mockReturnValueOnce({ data: [], error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "crowdsec" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getByText("500+")).toBeInTheDocument();
  });

  it("does not mark the alert count below the API limit", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: new Array(499).fill({}), error: undefined })
      .mockReturnValueOnce({ data: [], error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "crowdsec" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "crowdsec.alerts", 499);
  });

  it("renders null responses as 0 counts", () => {
    useWidgetAPI.mockImplementation(() => ({ data: null, error: undefined }));

    const { container } = renderWithProviders(<Component service={{ widget: { type: "crowdsec" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "crowdsec.alerts", 0);
    expectBlockValue(container, "crowdsec.bans", 0);
  });
});
