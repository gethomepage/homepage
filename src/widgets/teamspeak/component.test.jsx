// @vitest-environment jsdom

import { screen } from "@testing-library/react";

import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";

import Component from "./component";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({
  default: useWidgetAPI,
}));

describe("widgets/nextcloud/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("serverlist data parses and renders", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        body: [
          {
            guest_can_create_channels: "1",
            guest_can_create_homebase: "0",
            virtualserver_autostart: "1",
            virtualserver_clientsonline: "0",
            virtualserver_id: "1",
            virtualserver_machine_id: "",
            virtualserver_maxclients: "32",
            virtualserver_name: "TeamSpeak 6 Server",
            virtualserver_port: "9987",
            virtualserver_queryclientsonline: "0",
            virtualserver_status: "online",
            virtualserver_uptime: "77743",
            virtualserver_weblist_enabled: "1",
          },
        ],
        status: { code: 0, message: "ok" },
      },
      error: undefined,
    });

    const service = {
      widget: { type: "teamspeak" },
    };

    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expect(screen.getByText("teamspeak.name")).toBeInTheDocument();
    expect(screen.getByText("TeamSpeak 6 Server")).toBeInTheDocument();
    expect(screen.getByText("teamspeak.activeusers")).toBeInTheDocument();
    expect(screen.getByText("0/32")).toBeInTheDocument();
    expect(screen.getByText("teamspeak.status")).toBeInTheDocument();
    expect(screen.getByText("online")).toBeInTheDocument();
    expect(screen.getByText("teamspeak.uptime")).toBeInTheDocument();
    expect(screen.getByText("77743")).toBeInTheDocument();
  });
});
