// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue, findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

const peers = [
  { connected: true, login_expired: false, version: "0.81.3" },
  { connected: true, login_expired: false, version: "0.80.0" },
  { connected: false, login_expired: true, version: "0.81.3" },
  { connected: false, login_expired: false, version: "" },
];

const users = [
  { id: "1", is_service_user: false },
  { id: "2", is_service_user: false },
  { id: "3", is_service_user: true },
];

const version = {
  management_current_version: "0.81.3",
  management_update_available: false,
};

function mockApi({ peersData = peers, usersData = users, versionData = version, errors = {} } = {}) {
  useWidgetAPI.mockImplementation((widget, endpoint) => {
    if (errors[endpoint]) return { data: undefined, error: errors[endpoint] };
    if (endpoint === "peers") return { data: peersData, error: undefined };
    if (endpoint === "users") return { data: usersData, error: undefined };
    if (endpoint === "version") return { data: versionData, error: undefined };
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

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("netbird.online")).toBeInTheDocument();
    expect(screen.getByText("netbird.users")).toBeInTheDocument();
    expect(screen.getByText("netbird.version")).toBeInTheDocument();
    expect(screen.getByText("netbird.current_version")).toBeInTheDocument();
  });

  it("renders the default fields", () => {
    mockApi();

    const { container } = renderWidget();

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "netbird.online", "2 / 4");
    expectBlockValue(container, "netbird.users", "2");
    expectBlockValue(container, "netbird.version", "netbird.up_to_date");
    expectBlockValue(container, "netbird.current_version", "0.81.3");
  });

  it("falls back to the default fields when fields is empty", () => {
    mockApi();

    const { container } = renderWidget({ fields: [] });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "netbird.online", "2 / 4");
  });

  it("renders peers, login_expired and outdated counts", () => {
    mockApi();

    const { container } = renderWidget({ fields: ["peers", "login_expired", "outdated", "current_version"] });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expectBlockValue(container, "netbird.peers", "4");
    expectBlockValue(container, "netbird.login_expired", "1");
    // only the peer on 0.80.0 is older than the management server; the peer without a version is ignored
    expectBlockValue(container, "netbird.outdated", "1");
    expectBlockValue(container, "netbird.current_version", "0.81.3");
  });

  it("shows update_available when the management server has a newer release", () => {
    mockApi({ versionData: { ...version, management_update_available: true } });

    const { container } = renderWidget({ fields: ["version"] });

    expectBlockValue(container, "netbird.version", "netbird.update_available");
  });

  it("truncates to 4 fields when more are specified", () => {
    mockApi();

    const { container } = renderWidget({
      fields: ["peers", "online", "users", "login_expired", "outdated"],
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(findServiceBlockByLabel(container, "netbird.outdated")).toBeFalsy();
  });

  it("only requests the users endpoint when the users field is displayed", () => {
    mockApi();

    renderWidget({ fields: ["online", "version"] });

    const endpoints = useWidgetAPI.mock.calls.map((call) => call[1]);
    expect(endpoints).toContain("peers");
    expect(endpoints).toContain("version");
    expect(endpoints).not.toContain("users");
  });

  it("requests the users endpoint when the users field is displayed", () => {
    mockApi();

    renderWidget({ fields: ["users"] });

    expect(useWidgetAPI.mock.calls.map((call) => call[1])).toContain("users");
  });

  it("renders error message when the API returns an error", () => {
    mockApi({ errors: { peers: { message: "API error" } } });

    const { container } = renderWidget();

    expect(container.querySelectorAll(".service-block")).toHaveLength(0);
    expect(container.textContent).toContain("API error");
  });
});
