// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Integration from "./readarr";

describe("widgets/calendar/integrations/readarr", () => {
  it("adds release events with author name", async () => {
    useWidgetAPI.mockReturnValue({
      data: [
        {
          title: "Book",
          seriesTitle: "Series",
          releaseDate: "2099-01-01T00:00:00.000Z",
          grabbed: false,
          author: { authorName: "Author" },
          authorTitle: "Author Book",
        },
      ],
      error: undefined,
    });

    const setEvents = vi.fn();
    render(
      <Integration
        config={{ type: "readarr", color: "rose" }}
        params={{ start: "2099-01-01T00:00:00.000Z", end: "2099-01-02T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const next = setEvents.mock.calls[0][0]({});
    const [key] = Object.keys(next);
    expect(key).toContain("Author");
    expect(key).toContain("Book");
    expect(key).toContain("(Series)");
  });
});
