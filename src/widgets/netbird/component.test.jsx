// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const peers = [
  { connected: true, login_expired: false },
  { connected: true, login_expired: false },
  { connected: false, login_expired: true },
  { connected: false, login_expired: false },
];

const users = [
  { id: "1", is_service_user: false },
  { id: "2", is_service_user: false },
  { id: "3", is_service_user: true },
];

function mockApi({ peersData = peers, usersData = users, errors = {} } = {}) {
  useWidgetAPI.mockImplementation((widget, endpoint) => {
    if (errors[endpoint]) return { data: undefined, error: errors[endpoint] };
    if (endpoint === "peers") return { data: peersData, error: undefined };
    if (endpoint === "users") return { data: usersData, error: undefined };
    return { data: undefined, error: undefined };
  });
}

function renderWidget(widget = {}) {
  return renderWithProviders(<Component service={{ widget: { type: "netbird", ...widget } }} />, {
    settings: { hideErrors: false },
  });
}

describe("widgets/netbird/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWidget();

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expect(screen.getByText("netbird.online")).toBeInTheDocument();
    expect(screen.getByText("netbird.users")).toBeInTheDocument();
  });

  it("renders the default fields", () => {
    mockApi();

    const { container } = renderWidget();

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expectBlockValue(container, "netbird.online", "2 / 4");
    expectBlockValue(container, "netbird.users", "2");
  });

  it("renders login_expired when it is configured", () => {
    mockApi();

    const { container } = renderWidget({ fields: ["online", "login_expired"] });

    expect(container.querySelectorAll(".service-block")).toHaveLength(2);
    expectBlockValue(container, "netbird.online", "2 / 4");
    expectBlockValue(container, "netbird.login_expired", "1");
  });

  it("renders error message when the API returns an error", () => {
    mockApi({ errors: { peers: { message: "API error" } } });

    const { container } = renderWidget();

    expect(container.querySelectorAll(".service-block")).toHaveLength(0);
    expect(container.textContent).toContain("API error");
  });
});
