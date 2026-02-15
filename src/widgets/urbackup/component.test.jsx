// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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

describe("widgets/urbackup/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders placeholders while loading (optionally includes totalUsed)", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "urbackup", fields: ["ok", "errored", "noRecent", "totalUsed"] } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    // Container filters children by widget.fields.
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("urbackup.ok")).toBeInTheDocument();
    expect(screen.getByText("urbackup.errored")).toBeInTheDocument();
    expect(screen.getByText("urbackup.noRecent")).toBeInTheDocument();
    expect(screen.getByText("urbackup.totalUsed")).toBeInTheDocument();
  });

  it("renders ok/errored/noRecent and totalUsed when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        maxDays: 3,
        clientStatuses: [
          // ok
          {
            lastbackup: 1577836800,
            lastbackup_image: 1577836800,
            file_ok: true,
            image_ok: true,
            image_not_supported: false,
            image_disabled: false,
          },
          // errored
          {
            lastbackup: 1577836800,
            lastbackup_image: 1577836800,
            file_ok: false,
            image_ok: true,
            image_not_supported: false,
            image_disabled: false,
          },
          // no recent
          {
            lastbackup: 0,
            lastbackup_image: 0,
            file_ok: true,
            image_ok: true,
            image_not_supported: false,
            image_disabled: false,
          },
        ],
        diskUsage: [{ used: 1 }, { used: 2 }],
      },
      error: undefined,
    });

    const service = { widget: { type: "urbackup", fields: ["ok", "errored", "noRecent", "totalUsed"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "urbackup.ok", 1);
    expectBlockValue(container, "urbackup.errored", 1);
    expectBlockValue(container, "urbackup.noRecent", 1);
    expectBlockValue(container, "urbackup.totalUsed", 3);
  });
});
