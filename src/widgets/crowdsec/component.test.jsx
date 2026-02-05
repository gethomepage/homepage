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

describe("widgets/crowdsec/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("selects alerts24h endpoint when limit24h is enabled", () => {
    useWidgetAPI.mockImplementation(() => ({ data: undefined, error: undefined }));

    renderWithProviders(<Component service={{ widget: { type: "crowdsec", limit24h: true } }} />, {
      settings: { hideErrors: false },
    });

    expect(useWidgetAPI).toHaveBeenNthCalledWith(1, expect.any(Object), "alerts24h");
    expect(useWidgetAPI).toHaveBeenNthCalledWith(2, expect.any(Object), "bans");
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
});
