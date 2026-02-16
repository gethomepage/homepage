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
        return { data: { wanted: 1, missing: 2, have: 3, all: [{ id: 10, title: "Movie" }] }, error: undefined };
      if (endpoint === "queue/status") return { data: { totalCount: 1 }, error: undefined };
      if (endpoint === "queue/details")
        return {
          data: [{ movieId: 10, sizeLeft: 50, size: 100, timeLeft: "1m", trackedDownloadState: "importPending" }],
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
    expect(screen.getAllByTestId("queue-entry").map((el) => el.textContent)).toEqual(["Movie"]);
  });
});
