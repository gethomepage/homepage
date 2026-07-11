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
});
