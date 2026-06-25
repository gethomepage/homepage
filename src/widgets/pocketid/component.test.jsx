// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function mockEndpoints({ users, oidcClients }) {
  useWidgetAPI.mockImplementation((_widget, endpoint) => {
    if (endpoint === "users") return users;
    if (endpoint === "oidcClients") return oidcClients;
    return { data: undefined, error: undefined };
  });
}

describe("widgets/pocketid/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    mockEndpoints({
      users: { data: undefined, error: undefined },
      oidcClients: { data: undefined, error: undefined },
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pocketid" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("pocketid.users")).toBeInTheDocument();
    expect(screen.getByText("pocketid.oidcClients")).toBeInTheDocument();
  });

  it("renders error UI when an endpoint errors", () => {
    mockEndpoints({
      users: { data: undefined, error: { message: "invalid api key" } },
      oidcClients: { data: undefined, error: undefined },
    });

    renderWithProviders(<Component service={{ widget: { type: "pocketid" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("invalid api key")).toBeInTheDocument();
  });

  it("renders user and OIDC client counts", () => {
    mockEndpoints({
      users: { data: { pagination: { totalItems: 42 } }, error: undefined },
      oidcClients: { data: { pagination: { totalItems: 7 } }, error: undefined },
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "pocketid" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "pocketid.users", 42);
    expectBlockValue(container, "pocketid.oidcClients", 7);
  });
});
