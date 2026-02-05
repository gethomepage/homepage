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

describe("widgets/mailcow/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "mailcow", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("mailcow.mailboxes")).toBeInTheDocument();
    expect(screen.getByText("mailcow.aliases")).toBeInTheDocument();
    expect(screen.getByText("mailcow.quarantined")).toBeInTheDocument();
  });

  it("shows a helpful error when the API returns no domains", () => {
    useWidgetAPI.mockReturnValue({ data: [], error: undefined });

    renderWithProviders(<Component service={{ widget: { type: "mailcow", url: "http://x" } }} />, {
      settings: { hideErrors: false },
    });

    expect(screen.getAllByText(/widget\.api_error/i).length).toBeGreaterThan(0);
    expect(screen.getByText("No domains found")).toBeInTheDocument();
  });

  it("renders computed totals when loaded", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        { mboxes_in_domain: "2", msgs_total: "10", bytes_total: "100" },
        { mboxes_in_domain: "1", msgs_total: "5", bytes_total: "50" },
      ],
      error: undefined,
    });

    const { container } = renderWithProviders(
      <Component service={{ widget: { type: "mailcow", url: "http://x" } }} />,
      {
        settings: { hideErrors: false },
      },
    );

    expectBlockValue(container, "mailcow.domains", 2);
    expectBlockValue(container, "mailcow.mailboxes", 3);
    expectBlockValue(container, "mailcow.mails", 15);
    expectBlockValue(container, "mailcow.storage", 150);
  });
});
