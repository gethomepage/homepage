// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

function mockEndpoints(responses) {
  useWidgetAPI.mockImplementation((_widget, endpoint) => responses[endpoint] ?? { data: undefined, error: undefined });
}

describe("widgets/gitea/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("calls all four endpoints", () => {
    mockEndpoints({});

    renderWithProviders(<Component service={{ widget: { type: "gitea", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    const endpoints = useWidgetAPI.mock.calls.map(([, endpoint]) => endpoint);
    expect(endpoints).toEqual(["notifications", "issues", "pulls", "repositories"]);
  });

  it("renders placeholders while loading", () => {
    mockEndpoints({
      notifications: { data: { count: 1 }, error: undefined },
      issues: { data: { count: 2 }, error: undefined },
      repositories: { data: { count: 3 }, error: undefined },
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "gitea", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("gitea.notifications")).toBeInTheDocument();
    expect(screen.getByText("gitea.issues")).toBeInTheDocument();
    expect(screen.getByText("gitea.pulls")).toBeInTheDocument();
    expect(screen.getByText("gitea.repositories")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(4);
  });

  it("renders error UI when any endpoint errors", () => {
    mockEndpoints({
      notifications: { data: { count: 1 }, error: undefined },
      pulls: { data: undefined, error: { message: "nope" } },
    });

    renderWithProviders(<Component service={{ widget: { type: "gitea", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders total counts when loaded", () => {
    mockEndpoints({
      notifications: { data: { count: 42 }, error: undefined },
      issues: { data: { count: 1234 }, error: undefined },
      pulls: { data: { count: 56 }, error: undefined },
      repositories: { data: { count: 789 }, error: undefined },
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "gitea", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "gitea.notifications", 42);
    expectBlockValue(container, "gitea.issues", 1234);
    expectBlockValue(container, "gitea.pulls", 56);
    expectBlockValue(container, "gitea.repositories", 789);
  });

  it("renders zero counts", () => {
    mockEndpoints({
      notifications: { data: { count: 0 }, error: undefined },
      issues: { data: { count: 0 }, error: undefined },
      pulls: { data: { count: 0 }, error: undefined },
      repositories: { data: { count: 0 }, error: undefined },
    });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "gitea", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.queryByText("-")).not.toBeInTheDocument();
    expectBlockValue(container, "gitea.notifications", 0);
    expectBlockValue(container, "gitea.issues", 0);
    expectBlockValue(container, "gitea.pulls", 0);
    expectBlockValue(container, "gitea.repositories", 0);
  });
});
