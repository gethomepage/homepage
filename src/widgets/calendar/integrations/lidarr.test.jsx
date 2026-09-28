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
        {
          artist: { artistName: "Artist" },
          title: "Album",
          releaseDate: "2099-01-01T00:00:00.000Z",
          foreignAlbumId: "album",
          grabbed: true,
        },
      ],
      error: undefined,
    });

    const setEvents = vi.fn();
    render(
      <Integration
        config={{ type: "lidarr", baseUrl: "https://lidarr.example", color: "green" }}
        params={{ start: "2099-01-01T00:00:00.000Z", end: "2099-01-02T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const next = setEvents.mock.calls[0][0]({});
    const [entry] = Object.values(next);
    console.log(entry)
    expect(entry.title).toBe("Artist - Album");
    expect(entry.url).toBe("https://lidarr.example/album/album");
    expect(entry.isCompleted).toBe(true);
  });
});
