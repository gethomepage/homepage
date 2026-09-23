import { describe, expect, it } from "vitest";

import { expectWidgetConfigShape } from "test-utils/widget-config";

import widget from "./widget";

describe("radarr widget config", () => {
  it("exports a valid widget config", () => {
    expectWidgetConfigShape(widget);
  });

  it("sorts active downloads ahead of queued downloads", () => {
    const queue = widget.mappings["queue/details"].map(
      Buffer.from(
        JSON.stringify([
          {
            movieId: 1,
            status: "queued",
            trackedDownloadState: "downloading",
            size: 0,
            sizeleft: 0,
          },
          {
            movieId: 2,
            status: "downloading",
            trackedDownloadState: "downloading",
            size: 100,
            sizeleft: 50,
          },
        ]),
      ),
    );

    expect(queue.map((entry) => entry.movieId)).toEqual([2, 1]);
  });

  it("maps movie counts and titles", () => {
    const movies = widget.mappings.movie.map(
      Buffer.from(
        JSON.stringify([
          { id: 1, title: "A", monitored: true, hasFile: false, isAvailable: true },
          { id: 2, title: "B", monitored: true, hasFile: true },
          { id: 3, title: "C", monitored: true, hasFile: false, isAvailable: false },
        ]),
      ),
    );

    expect(movies).toEqual({
      wanted: 1,
      have: 1,
      missing: 2,
      all: [
        { title: "A", id: 1 },
        { title: "B", id: 2 },
        { title: "C", id: 3 },
      ],
    });
  });
});
