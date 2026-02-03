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

describe("widgets/slskd/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields to 4 and renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "slskd" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["slskStatus", "downloads", "uploads", "sharedFiles"]);
    // Container filters children by widget.fields.
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("slskd.slskStatus")).toBeInTheDocument();
    expect(screen.getByText("slskd.downloads")).toBeInTheDocument();
    expect(screen.getByText("slskd.uploads")).toBeInTheDocument();
    expect(screen.getByText("slskd.sharedFiles")).toBeInTheDocument();
    expect(screen.queryByText("slskd.updateStatus")).toBeNull();
  });

  it("caps widget.fields at 4 entries", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "slskd", fields: ["a", "b", "c", "d", "e"] } };
    renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["a", "b", "c", "d"]);
  });

  it("renders status and counts when loaded", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "application") {
        return {
          data: {
            server: { isConnected: true },
            version: { isUpdateAvailable: false },
            shares: { files: 12 },
          },
          error: undefined,
        };
      }
      if (endpoint === "downloads") return { data: [{ id: 1 }], error: undefined };
      if (endpoint === "uploads") return { data: [{ id: 1 }, { id: 2 }], error: undefined };
      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "slskd", fields: ["slskStatus", "downloads", "uploads", "sharedFiles"] } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "slskd.slskStatus", "slskd.connected");
    expectBlockValue(container, "slskd.downloads", 1);
    expectBlockValue(container, "slskd.uploads", 2);
    expectBlockValue(container, "slskd.sharedFiles", 12);
  });
});
