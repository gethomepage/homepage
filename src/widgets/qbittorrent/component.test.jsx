// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

vi.mock("../../components/widgets/queue/queueEntry", () => ({
  default: ({ title }) => <div data-testid="queue-entry">{title}</div>,
}));

import Component from "./component";

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

  it("uses lightweight endpoints for counts/rates and filtered torrents for leech progress", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint, query) => {
      if (endpoint === "transfer") {
        return { data: { dl_info_speed: 15, up_info_speed: 3 }, error: undefined };
      }
      if (endpoint === "torrentCount" && !query) {
        return { data: 2, error: undefined };
      }
      if (endpoint === "torrentCount" && query?.filter === "completed") {
        return { data: 1, error: undefined };
      }
      if (endpoint === "torrents" && query?.filter === "downloading") {
        return {
          data: [
            {
              name: "B",
              progress: 0.5,
              state: "downloading",
              eta: 60,
              size: 100,
              amount_left: 50,
            },
          ],
          error: undefined,
        };
      }
      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "qbittorrent", enableLeechProgress: true } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "qbittorrent.leech", 1);
    expectBlockValue(container, "qbittorrent.seed", 1);
    expectBlockValue(container, "qbittorrent.download", 15);
    expectBlockValue(container, "qbittorrent.upload", 3);

    expect(screen.getAllByTestId("queue-entry").map((el) => el.textContent)).toEqual(["B"]);
  });
});
