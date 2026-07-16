// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Integration from "./ical";

describe("widgets/calendar/integrations/ical", () => {
  it("adds parsed events within the date range", async () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:uid1",
          "DTSTAMP:20990101T000000Z",
          "DTSTART:20990101T130000Z",
          "DTEND:20990101T140000Z",
          "SUMMARY:Test Event",
          "LOCATION:Office",
          "URL:https://example.com",
          "END:VEVENT",
          "END:VCALENDAR",
          "",
        ].join("\n"),
      },
      error: undefined,
    });

    const setEvents = vi.fn();
    render(
      <Integration
        config={{ name: "Work", type: "ical", color: "blue", params: { showName: true } }}
        params={{ start: "2099-01-01T00:00:00.000Z", end: "2099-01-02T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
        timezone="utc"
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const updater = setEvents.mock.calls[0][0];
    const next = updater({});
    const entries = Object.values(next);
    expect(entries).toHaveLength(1);

    const [event] = entries;
    expect(event.title).toBe("Work: Test Event");
    expect(event.color).toBe("blue");
    expect(event.type).toBe("ical");
    expect(event.additional).toBe("Office");
    expect(event.url).toBe("https://example.com");
    expect(event.isCompleted).toBe(false);
  });

  it("adds an all-day event on every day before its exclusive end date", async () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Homepage Test//iCal Multi-Day Event//EN",
          "BEGIN:VEVENT",
          "UID:multi-day-all-day@example.test",
          "DTSTAMP:20260716T000000Z",
          "DTSTART;VALUE=DATE:20260716",
          "DTEND;VALUE=DATE:20260719",
          "SUMMARY:Three-day PTO",
          "END:VEVENT",
          "END:VCALENDAR",
          "",
        ].join("\n"),
      },
      error: undefined,
    });

    const setEvents = vi.fn();
    render(
      <Integration
        config={{ name: "PTO", type: "ical", color: "red" }}
        params={{ start: "2026-04-16", end: "2026-10-16" }}
        setEvents={setEvents}
        hideErrors
        timezone="America/Los_Angeles"
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const updater = setEvents.mock.calls[0][0];
    const entries = Object.values(updater({}));
    expect(entries.map((event) => event.date.toISODate()).sort()).toEqual(["2026-07-16", "2026-07-17", "2026-07-18"]);
  });
});
