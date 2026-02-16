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

describe("widgets/pangolin/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields to 4 entries and renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "pangolin" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["sites", "resources", "targets", "traffic"]);
    // Container filters by widget.fields, so only the default 4 blocks are visible.
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("pangolin.sites")).toBeInTheDocument();
    expect(screen.getByText("pangolin.resources")).toBeInTheDocument();
    expect(screen.getByText("pangolin.targets")).toBeInTheDocument();
    expect(screen.getByText("pangolin.traffic")).toBeInTheDocument();
    expect(screen.queryByText("pangolin.in")).toBeNull();
    expect(screen.queryByText("pangolin.out")).toBeNull();
  });

  it("caps widget.fields at 4 entries", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "pangolin", fields: ["sites", "resources", "targets", "traffic", "extra"] } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["sites", "resources", "targets", "traffic"]);
  });

  it("renders computed site/resource/target totals and traffic bytes", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "sites") {
        return {
          data: {
            data: {
              sites: [
                { online: true, megabytesIn: 1, megabytesOut: 2 },
                { online: false, megabytesIn: 3, megabytesOut: 4 },
              ],
            },
          },
          error: undefined,
        };
      }

      if (endpoint === "resources") {
        return {
          data: {
            data: {
              resources: [
                { targets: [{ healthStatus: "healthy" }, { healthStatus: "unhealthy" }] },
                { targets: [] }, // counts as healthy
              ],
            },
          },
          error: undefined,
        };
      }

      return { data: undefined, error: undefined };
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pangolin" } }} />, {
      settings: { hideErrors: false },
    });

    // sites: 1 / 2 online
    expectBlockValue(container, "pangolin.sites", "1 / 2");
    // resources: both healthy => 2 / 2
    expectBlockValue(container, "pangolin.resources", "2 / 2");
    // targets: 1 healthy out of 2 total
    expectBlockValue(container, "pangolin.targets", "1 / 2");

    // traffic bytes: (1+3) MB in + (2+4) MB out = 10MB => 10_000_000 bytes.
    expectBlockValue(container, "pangolin.traffic", 10_000_000);
    expect(findServiceBlockByLabel(container, "pangolin.in")).toBeUndefined();
    expect(findServiceBlockByLabel(container, "pangolin.out")).toBeUndefined();
  });

  it("can show in/out traffic when selected via widget.fields", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "sites") {
        return {
          data: { data: { sites: [{ online: true, megabytesIn: 1, megabytesOut: 2 }] } },
          error: undefined,
        };
      }

      if (endpoint === "resources") {
        return { data: { data: { resources: [] } }, error: undefined };
      }

      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "pangolin", fields: ["sites", "resources", "in", "out"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "pangolin.in", 1_000_000);
    expectBlockValue(container, "pangolin.out", 2_000_000);
  });
});
