// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { findServiceBlockByLabel } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

vi.mock("../../components/widgets/queue/queueEntry", () => ({
  default: ({ title }) => <div data-testid="queue-entry">{title}</div>,
}));

import Component from "./component";

function expectBlockValue(container, label, value) {
  const block = findServiceBlockByLabel(container, label);
  expect(block, `missing block for ${label}`).toBeTruthy();
  expect(block.textContent).toContain(String(value));
}

describe("widgets/deluge/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "deluge" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("deluge.leech")).toBeInTheDocument();
    expect(screen.getByText("deluge.download")).toBeInTheDocument();
    expect(screen.getByText("deluge.seed")).toBeInTheDocument();
    expect(screen.getByText("deluge.upload")).toBeInTheDocument();
  });

  it("computes leech/seed counts and upload/download rates, and renders leech progress entries", () => {
    useWidgetAPI.mockReturnValue({
      data: {
        torrents: {
          a: { download_payload_rate: 10, upload_payload_rate: 1, total_remaining: 0, state: "Seeding", progress: 100 },
          b: {
            download_payload_rate: 5,
            upload_payload_rate: 2,
            total_remaining: 5,
            state: "Downloading",
            progress: 50,
            eta: 60,
            name: "B",
          },
          c: {
            download_payload_rate: 0,
            upload_payload_rate: 3,
            total_remaining: 10,
            state: "Downloading",
            progress: 10,
            eta: 120,
            name: "C",
          },
        },
      },
      error: undefined,
    });

    const service = { widget: { type: "deluge", enableLeechProgress: true } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // keys=3, completed=1 => leech=2
    expectBlockValue(container, "deluge.leech", 2);
    expectBlockValue(container, "deluge.seed", 1);
    expectBlockValue(container, "deluge.download", 15);
    expectBlockValue(container, "deluge.upload", 6);

    // Only downloading torrents get QueueEntry.
    expect(screen.getAllByTestId("queue-entry").map((el) => el.textContent)).toEqual(["B", "C"]);
  });
});
