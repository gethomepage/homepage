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

describe("widgets/qbittorrent/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "qbittorrent" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("qbittorrent.leech")).toBeInTheDocument();
    expect(screen.getByText("qbittorrent.download")).toBeInTheDocument();
    expect(screen.getByText("qbittorrent.seed")).toBeInTheDocument();
    expect(screen.getByText("qbittorrent.upload")).toBeInTheDocument();
  });

  it("computes leech/seed counts and upload/download rates, and can render leech progress entries", () => {
    useWidgetAPI.mockReturnValue({
      data: [
        { name: "A", dlspeed: 10, upspeed: 1, progress: 1, state: "uploading" },
        { name: "B", dlspeed: 5, upspeed: 2, progress: 0.5, state: "downloading", eta: 60, size: 100, amount_left: 50 },
      ],
      error: undefined,
    });

    const service = { widget: { type: "qbittorrent", enableLeechProgress: true } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    // total=2, completed=1 => leech=1
    expectBlockValue(container, "qbittorrent.leech", 1);
    expectBlockValue(container, "qbittorrent.seed", 1);
    expectBlockValue(container, "qbittorrent.download", 15);
    expectBlockValue(container, "qbittorrent.upload", 3);

    expect(screen.getAllByTestId("queue-entry").map((el) => el.textContent)).toEqual(["B"]);
  });
});
