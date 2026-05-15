// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/forgejo/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // notifications
      .mockReturnValueOnce({ data: undefined, error: undefined }) // issues
      .mockReturnValueOnce({ data: undefined, error: undefined }) // repositories
      .mockReturnValueOnce({ data: undefined, error: undefined }); // commits

    const { container } = renderWithProviders(<Component service={{ widget: { type: "forgejo", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(5);
    expect(screen.getByText("forgejo.notifications")).toBeInTheDocument();
    expect(screen.getByText("forgejo.issues")).toBeInTheDocument();
    expect(screen.getByText("forgejo.pulls")).toBeInTheDocument();
    expect(screen.getByText("forgejo.repositories")).toBeInTheDocument();
    expect(screen.getByText("forgejo.commits")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(5);
  });

  it("renders error UI when any endpoint errors", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: { message: "nope" } })
      .mockReturnValueOnce({ data: undefined, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "forgejo", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders computed counts when loaded", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: [{ id: 1 }, { id: 2 }], error: undefined })
      .mockReturnValueOnce({
        data: { issues: [{ id: 1 }], pulls: [{ id: 1 }, { id: 2 }, { id: 3 }] },
        error: undefined,
      })
      .mockReturnValueOnce({ data: { data: [{ id: 1 }] }, error: undefined })
      .mockReturnValueOnce({ data: { total_commits: 42 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "forgejo", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "forgejo.notifications", 2);
    expectBlockValue(container, "forgejo.issues", 1);
    expectBlockValue(container, "forgejo.pulls", 3);
    expectBlockValue(container, "forgejo.repositories", 1);
    expectBlockValue(container, "forgejo.commits", 42);
  });
});
