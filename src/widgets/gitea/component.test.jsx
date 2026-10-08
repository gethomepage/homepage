// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Component from "./component";

describe("widgets/gitea/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // notifications
      .mockReturnValueOnce({ data: undefined, error: undefined }) // issues
      .mockReturnValueOnce({ data: undefined, error: undefined }) // pulls
      .mockReturnValueOnce({ data: undefined, error: undefined }); // repositories

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
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: { message: "nope" } })
      .mockReturnValueOnce({ data: undefined, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "gitea", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders total counts when loaded", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: { count: 2 }, error: undefined })
      .mockReturnValueOnce({ data: { count: 1234 }, error: undefined })
      .mockReturnValueOnce({ data: { count: 0 }, error: undefined })
      .mockReturnValueOnce({ data: { count: 56 }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "gitea", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "gitea.notifications", 2);
    expectBlockValue(container, "gitea.issues", 1234);
    expectBlockValue(container, "gitea.pulls", 0);
    expectBlockValue(container, "gitea.repositories", 56);
  });
});
