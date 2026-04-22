// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue, findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/tailscale/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2020-01-01T00:00:00Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const fullData = {
    addresses: ["127.0.0.1"],
    keyExpiryDisabled: false,
    expires: "2020-06-01T00:00:00Z",
    lastSeen: "2019-12-31T23:55:00Z",
    user: "fin@example.com",
    hostname: "localhost",
    name: "localhost.tail1234.ts.net",
    clientVersion: "1.1.0",
    os: "linux",
    created: "2019-06-01T00:00:00Z",
    authorized: true,
    isExternal: false,
    updateAvailable: true,
    tags: ["server", "prod"],
  };

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tailscale" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("tailscale.address")).toBeInTheDocument();
    expect(screen.getByText("tailscale.last_seen")).toBeInTheDocument();
    expect(screen.getByText("tailscale.expires")).toBeInTheDocument();
  });

  describe("fields group: address, last_seen, expires, user", () => {
    it("renders only the specified 4 fields", () => {
      useWidgetAPI.mockReturnValue({ data: fullData, error: undefined });

      const { container } = renderWithProviders(
        <Component service={{ widget: { type: "tailscale", fields: ["address", "last_seen", "expires", "user"] } }} />,
        { settings: { hideErrors: false } },
      );

      expect(container.querySelectorAll(".service-block")).toHaveLength(4);
      expectBlockValue(container, "tailscale.address", "127.0.0.1");
      expectBlockValue(container, "tailscale.last_seen", "tailscale.ago");
      expectBlockValue(container, "tailscale.expires", "tailscale.weeks");
      expectBlockValue(container, "tailscale.user", "fin@example.com");
    });
  });

  describe("fields group: hostname, name, client_version, os", () => {
    it("renders only the specified 4 fields", () => {
      useWidgetAPI.mockReturnValue({ data: fullData, error: undefined });

      const { container } = renderWithProviders(
        <Component service={{ widget: { type: "tailscale", fields: ["hostname", "name", "client_version", "os"] } }} />,
        { settings: { hideErrors: false } },
      );

      expect(container.querySelectorAll(".service-block")).toHaveLength(4);
      expectBlockValue(container, "tailscale.hostname", "localhost");
      expectBlockValue(container, "tailscale.name", "localhost.tail1234.ts.net");
      expectBlockValue(container, "tailscale.client_version", "1.1.0");
      expectBlockValue(container, "tailscale.os", "linux");
    });
  });

  describe("fields group: created, authorized, is_external, update_available", () => {
    it("renders only the specified 4 fields", () => {
      useWidgetAPI.mockReturnValue({ data: fullData, error: undefined });

      const { container } = renderWithProviders(
        <Component
          service={{
            widget: { type: "tailscale", fields: ["created", "authorized", "is_external", "update_available"] },
          }}
        />,
        { settings: { hideErrors: false } },
      );

      expect(container.querySelectorAll(".service-block")).toHaveLength(4);
      expectBlockValue(container, "tailscale.created", "2019-06-01T00:00:00Z");
      expectBlockValue(container, "tailscale.authorized", "tailscale.true");
      expectBlockValue(container, "tailscale.is_external", "tailscale.false");
      expectBlockValue(container, "tailscale.update_available", "tailscale.true");
    });
  });

  describe("fields group: tags with defaults", () => {
    it("renders tags alongside default fields", () => {
      useWidgetAPI.mockReturnValue({ data: fullData, error: undefined });

      const { container } = renderWithProviders(
        <Component service={{ widget: { type: "tailscale", fields: ["address", "last_seen", "expires", "tags"] } }} />,
        { settings: { hideErrors: false } },
      );

      expect(container.querySelectorAll(".service-block")).toHaveLength(4);
      expectBlockValue(container, "tailscale.address", "127.0.0.1");
      expectBlockValue(container, "tailscale.tags", "server, prod");
    });
  });

  describe("fields truncation", () => {
    it("truncates to 4 fields when more than 4 are specified", () => {
      useWidgetAPI.mockReturnValue({ data: fullData, error: undefined });

      const { container } = renderWithProviders(
        <Component
          service={{ widget: { type: "tailscale", fields: ["address", "last_seen", "expires", "user", "hostname"] } }}
        />,
        { settings: { hideErrors: false } },
      );

      expect(container.querySelectorAll(".service-block")).toHaveLength(4);
      expect(findServiceBlockByLabel(container, "tailscale.hostname")).toBeFalsy();
    });

    it("defaults to address, last_seen, expires when fields is empty", () => {
      useWidgetAPI.mockReturnValue({ data: fullData, error: undefined });

      const { container } = renderWithProviders(<Component service={{ widget: { type: "tailscale", fields: [] } }} />, {
        settings: { hideErrors: false },
      });

      expect(container.querySelectorAll(".service-block")).toHaveLength(3);
      expectBlockValue(container, "tailscale.address", "127.0.0.1");
      expectBlockValue(container, "tailscale.last_seen", "tailscale.ago");
      expectBlockValue(container, "tailscale.expires", "tailscale.weeks");
    });
  });

  it("renders never for expires if key expiry is disabled", () => {
    useWidgetAPI.mockReturnValue({
      data: { ...fullData, keyExpiryDisabled: true },
      error: undefined,
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tailscale" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "tailscale.expires", "tailscale.never");
  });

  it("renders error message when API returns an error", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: { message: "API error" } });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "tailscale" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(0);
    expect(container.textContent).toContain("API error");
  });
});
