// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Integration from "./lidarr";

describe("widgets/calendar/integrations/lidarr", () => {
  it("adds release events", async () => {
    useWidgetAPI.mockReturnValue({
      data: [
        { artist: { artistName: "Artist" }, title: "Album", releaseDate: "2099-01-01T00:00:00.000Z", grabbed: true },
      ],
      error: undefined,
    });

    const setEvents = vi.fn();
    render(
      <Integration
        config={{ type: "lidarr", color: "green" }}
        params={{ start: "2099-01-01T00:00:00.000Z", end: "2099-01-02T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const next = setEvents.mock.calls[0][0]({});
    expect(Object.keys(next)).toEqual(["Artist - Album"]);
    expect(next["Artist - Album"].isCompleted).toBe(true);
  });
});
