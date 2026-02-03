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

describe("widgets/sonarr/component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders placeholders while loading", () => {
    useWidgetAPI.mockReturnValue({ data: undefined, error: undefined });

    const { container } = renderWithProviders(<Component service={{ widget: { type: "sonarr" } }} />, {
      settings: { hideErrors: false },
    });

    expect(container.querySelectorAll(".service-block")).toHaveLength(3);
    expect(screen.getByText("sonarr.wanted")).toBeInTheDocument();
    expect(screen.getByText("sonarr.queued")).toBeInTheDocument();
    expect(screen.getByText("sonarr.series")).toBeInTheDocument();
  });

  it("renders counts and queue entries when enabled", () => {
    useWidgetAPI.mockImplementation((_widget, endpoint) => {
      if (endpoint === "wanted/missing") return { data: { totalRecords: 1 }, error: undefined };
      if (endpoint === "queue") return { data: { totalRecords: 2 }, error: undefined };
      if (endpoint === "series") return { data: [{ id: 10, title: "Show" }], error: undefined };
      if (endpoint === "queue/details") {
        return {
          data: [
            {
              seriesId: 10,
              episodeId: 1,
              episodeTitle: "Ep",
              sizeLeft: 50,
              size: 100,
              timeLeft: "1m",
              trackedDownloadState: "importPending",
            },
          ],
          error: undefined,
        };
      }
      return { data: undefined, error: undefined };
    });

    const service = { widget: { type: "sonarr", enableQueue: true } };
    const { container } = renderWithProviders(<Component service={service} />, { settings: { hideErrors: false } });

    expectBlockValue(container, "sonarr.wanted", 1);
    expectBlockValue(container, "sonarr.queued", 2);
    expectBlockValue(container, "sonarr.series", 1);
    expect(screen.getAllByTestId("queue-entry").map((el) => el.textContent)).toEqual(["Show: Ep"]);
  });
});
