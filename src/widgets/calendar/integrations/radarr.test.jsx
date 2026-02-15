// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Integration from "./radarr";

describe("widgets/calendar/integrations/radarr", () => {
  it("adds cinema/physical/digital events", async () => {
    useWidgetAPI.mockReturnValue({
      data: [
        {
          title: "Movie",
          titleSlug: "movie",
          hasFile: false,
          inCinemas: "2099-01-01T00:00:00.000Z",
          physicalRelease: "2099-01-02T00:00:00.000Z",
          digitalRelease: "2099-01-03T00:00:00.000Z",
        },
      ],
      error: undefined,
    });

    const setEvents = vi.fn();
    render(
      <Integration
        config={{ type: "radarr", baseUrl: "https://radarr.example", color: "amber" }}
        params={{ start: "2099-01-01T00:00:00.000Z", end: "2099-01-10T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const next = setEvents.mock.calls[0][0]({});
    const keys = Object.keys(next);
    expect(keys.some((k) => k.includes("calendar.inCinemas"))).toBe(true);
    expect(keys.some((k) => k.includes("calendar.physicalRelease"))).toBe(true);
    expect(keys.some((k) => k.includes("calendar.digitalRelease"))).toBe(true);
    expect(Object.values(next)[0].url).toBe("https://radarr.example/movie/movie");
  });
});
