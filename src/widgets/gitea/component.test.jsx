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

describe("widgets/gitea/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // notifications
      .mockReturnValueOnce({ data: undefined, error: undefined }) // issues
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
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "gitea", url: "http://x" } }} />, {
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
      .mockReturnValueOnce({ data: { data: [{ id: 1 }] }, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "gitea", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "gitea.notifications", 2);
    expectBlockValue(container, "gitea.issues", 1);
    expectBlockValue(container, "gitea.pulls", 3);
    expectBlockValue(container, "gitea.repositories", 1);
  });
});
