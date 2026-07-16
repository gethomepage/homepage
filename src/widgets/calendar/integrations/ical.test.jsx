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

  it("expands an all-day multi-day event into one entry per day (DTEND exclusive)", async () => {
    // Typical of all-day PTO events: DTSTART/DTEND are date-only and DTEND is
    // exclusive, so 20990101..20990104 covers Jan 1, 2 and 3 (three days).
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:uid-multi",
          "DTSTAMP:20990101T000000Z",
          "DTSTART;VALUE=DATE:20990101",
          "DTEND;VALUE=DATE:20990104",
          "SUMMARY:PTO",
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
        config={{ name: "Calendar", type: "ical", color: "green", params: {} }}
        params={{ start: "2099-01-01T00:00:00.000Z", end: "2099-02-01T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
        timezone="utc"
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const entries = Object.values(setEvents.mock.calls[0][0]({}));
    expect(entries).toHaveLength(3);

    const days = entries.map((e) => e.date.toISODate()).sort();
    expect(days).toEqual(["2099-01-01", "2099-01-02", "2099-01-03"]);
    entries.forEach((e) => expect(e.title).toBe("PTO"));
  });

  it("clips a multi-day event to the visible range", async () => {
    // Event spans Jan 28 .. Feb 9 (exclusive), but the range only shows up to
    // Feb 1 (inclusive), so only Jan 28..Feb 1 should be produced.
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:uid-clip",
          "DTSTAMP:20990101T000000Z",
          "DTSTART;VALUE=DATE:20990128",
          "DTEND;VALUE=DATE:20990209",
          "SUMMARY:Long PTO",
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
        config={{ name: "Calendar", type: "ical", color: "green", params: {} }}
        params={{ start: "2099-01-01T00:00:00.000Z", end: "2099-02-01T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
        timezone="utc"
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const entries = Object.values(setEvents.mock.calls[0][0]({}));
    const days = entries.map((e) => e.date.toISODate()).sort();
    expect(days).toEqual(["2099-01-28", "2099-01-29", "2099-01-30", "2099-01-31", "2099-02-01"]);
  });

  it("expands a yearly recurring single-day event to one entry per occurrence", async () => {
    // Typical of yearly birthdays: FREQ=YEARLY, one-day span (DTEND exclusive).
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:uid-bday",
          "DTSTAMP:20000101T000000Z",
          "RRULE:FREQ=YEARLY",
          "DTSTART;VALUE=DATE:19900215",
          "DTEND;VALUE=DATE:19900216",
          "SUMMARY:Birthday",
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
        config={{ name: "Calendar", type: "ical", color: "green", params: {} }}
        params={{ start: "2099-01-01T00:00:00.000Z", end: "2099-12-31T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
        timezone="utc"
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const entries = Object.values(setEvents.mock.calls[0][0]({}));
    // Exactly one occurrence (Feb 15) within the single year in range.
    expect(entries).toHaveLength(1);
    expect(entries[0].date.toISODate()).toBe("2099-02-15");
    expect(entries[0].title).toBe("Birthday");
  });
});
