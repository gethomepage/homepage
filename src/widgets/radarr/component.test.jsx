// @vitest-environment jsdom

import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { renderWithProviders } from "test-utils/render-with-providers";
import { expectBlockValue } from "test-utils/widget-assertions";

const { useWidgetAPI } = vi.hoisted(() => ({ useWidgetAPI: vi.fn() }));
vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

vi.mock("../../components/widgets/queue/queueEntry", () => ({
  default: ({ title, activity, progress }) => (
    <div data-testid="queue-entry" data-activity={activity} data-progress={progress}>
      {title}
    </div>
  ),
}));

import Component from "./component";

describe("widgets/radarr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "radarr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(4);
    expect(screen.getByText("radarr.wanted")).toBeInTheDocument();
    expect(screen.getByText("radarr.missing")).toBeInTheDocument();
    expect(screen.getByText("radarr.queued")).toBeInTheDocument();
    expect(screen.getByText("radarr.movies")).toBeInTheDocument();
  });

  it("renders counts and queue entries when enabled", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "movie")
        return {
          data: {
            wanted: 1,
            missing: 2,
            have: 3,
            all: [
              { id: 10, title: "Queued Movie" },
              { id: 11, title: "Imported Movie" },
            ],
          },
          error: undefined,
        };
      if (endpoint === "queue/status") return { data: { totalCount: 1 }, error: undefined };
      if (endpoint === "queue/details")
        return {
          data: [
            {
              movieId: 10,
              sizeLeft: 0,
              size: 0,
              status: "queued",
              trackedDownloadState: "downloading",
            },
            {
              movieId: 11,
              sizeLeft: 0,
              size: 100,
              status: "completed",
              trackedDownloadState: "importPending",
            },
          ],
          error: undefined,
        };
      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "radarr", enableQueue: true } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "radarr.wanted", 1);
    expectBlockValue(container, "radarr.missing", 2);
    expectBlockValue(container, "radarr.queued", 1);
    expectBlockValue(container, "radarr.movies", 3);
    const queueEntries = screen.getAllByTestId("queue-entry");
    expect(queueEntries.map((el) => el.textContent)).toEqual(["Queued Movie", "Imported Movie"]);
    expect(queueEntries.map((el) => [el.dataset.activity, el.dataset.progress])).toEqual([
      ["queued", "0"],
      ["import pending", "100"],
    ]);
  });
});
