// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Integration from "./sonarr";

describe("widgets/calendar/integrations/sonarr", () => {
  it("adds episode events", async () => {
    useWidgetAPI.mockReturnValue({
      data: [
        {
          series: { title: "Show", titleSlug: "show" },
          seasonNumber: 1,
          episodeNumber: 2,
          airDateUtc: "2099-01-01T00:00:00.000Z",
          hasFile: true,
        },
      ],
      error: undefined,
    });

    const setEvents = vi.fn();
    render(
      <Integration
        config={{ type: "sonarr", baseUrl: "https://sonarr.example", color: "teal" }}
        params={{ start: "2099-01-01T00:00:00.000Z", end: "2099-01-02T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const next = setEvents.mock.calls[0][0]({});
    const [entry] = Object.values(next);
    expect(entry.title).toBe("Show");
    expect(entry.additional).toBe("S1 E2");
    expect(entry.url).toBe("https://sonarr.example/series/show");
    expect(entry.isCompleted).toBe(true);
  });
});
