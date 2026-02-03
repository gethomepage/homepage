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

describe("widgets/gluetun/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields and filters to 3 blocks while loading (no port_forwarded)", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "gluetun", url: "http://x" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["public_ip", "region", "country"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("gluetun.public_ip")).toBeInTheDocument();
    expect(screen.getByText("gluetun.region")).toBeInTheDocument();
    expect(screen.getByText("gluetun.country")).toBeInTheDocument();
    expect(screen.queryByText("gluetun.port_forwarded")).toBeNull();
  });

  it("renders error UI when widget API errors", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "nope" } });

    renderWithProviders(<Component service={{ widget: { type: "gluetun", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("includes port_forwarded and uses the v2 endpoint when widget.version > 1", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { public_ip: "1.2.3.4", region: "CA", country: "US" }, error: undefined })
      .mockReturnValueOnce({ data: { port: 12345 }, error: undefined });

    const service = {
      widget: {
        type: "gluetun",
        url: "http://x",
        version: 2,
        fields: ["public_ip", "region", "country", "port_forwarded"],
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(useWidgetAPI.mock.calls[0][1]).toBe("ip");
    expect(useWidgetAPI.mock.calls[1][1]).toBe("port_forwarded_v2");

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "gluetun.public_ip", "1.2.3.4");
    expectBlockValue(container, "gluetun.region", "CA");
    expectBlockValue(container, "gluetun.country", "US");
    expectBlockValue(container, "gluetun.port_forwarded", 12345);
  });
});
