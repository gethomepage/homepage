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

describe("widgets/gotify/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined }) // application
      .mockReturnValueOnce({ data: undefined, error: undefined }) // message
      .mockReturnValueOnce({ data: undefined, error: undefined }); // client

    const { container } = renderWithProviders(<Component service={{ widget: { type: "gotify", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("gotify.apps")).toBeInTheDocument();
    expect(screen.getByText("gotify.clients")).toBeInTheDocument();
    expect(screen.getByText("gotify.messages")).toBeInTheDocument();
    expect(screen.getAllByText("-")).toHaveLength(3);
  });

  it("renders error UI when any endpoint errors", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: undefined, error: undefined })
      .mockReturnValueOnce({ data: undefined, error: { message: "nope" } })
      .mockReturnValueOnce({ data: undefined, error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "gotify", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("nope")).toBeInTheDocument();
  });

  it("renders computed counts when loaded", () => {
    useWidgetAPI
      .mockReturnValueOnce({ data: [{ id: 1 }, { id: 2 }], error: undefined })
      .mockReturnValueOnce({ data: { messages: [{ id: 1 }] }, error: undefined })
      .mockReturnValueOnce({ data: [{ id: 1 }, { id: 2 }, { id: 3 }], error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "gotify", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expectBlockValue(container, "gotify.apps", 2);
    expectBlockValue(container, "gotify.clients", 3);
    expectBlockValue(container, "gotify.messages", 1);
  });
});
