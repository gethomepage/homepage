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

describe("widgets/gamedig/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("defaults fields and filters blocks while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const service = { widget: { type: "gamedig", url: "http://x" } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["map", "currentPlayers", "ping"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("gamedig.map")).toBeInTheDocument();
    expect(screen.getByText("gamedig.currentPlayers")).toBeInTheDocument();
    expect(screen.getByText("gamedig.ping")).toBeInTheDocument();
    expect(screen.queryByText("gamedig.status")).toBeNull();
  });

  it("caps fields at 4 and renders online values", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        online: true,
        name: "Server1",
        map: "MapA",
        players: 5,
        maxplayers: 10,
        bots: 1,
        ping: 42,
      },
      error: undefined,
    });

    const service = {
      widget: {
        type: "gamedig",
        url: "http://x",
        fields: ["status", "name", "map", "currentPlayers", "ping"],
      },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(service.widget.fields).toEqual(["status", "name", "map", "currentPlayers"]);
    expect(container.querySelectorAll(".service-block")).toHaveLength(4);

    expectBlockValue(container, "gamedig.status", "gamedig.online");
    expectBlockValue(container, "gamedig.name", "Server1");
    expectBlockValue(container, "gamedig.map", "MapA");
    expectBlockValue(container, "gamedig.currentPlayers", "5 / 10");
    expect(screen.queryByText("gamedig.ping")).toBeNull();
  });
});
