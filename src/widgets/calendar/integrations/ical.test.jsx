// @vitest-environment jsdom

import { render, waitFor } from "@testing-library/react";
import ICAL from "ical.js";
import { afterEach, describe, expect, it, vi } from "vitest";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Integration from "./ical";

describe("widgets/calendar/integrations/ical", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });
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

  it("does not spill a timed event ending at midnight into the next day", async () => {
    // Monday 20:00 through Tuesday 00:00. The event ends the instant Tuesday
    // begins, so it should only occupy Monday.
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:uid-midnight",
          "DTSTAMP:20990101T000000Z",
          "DTSTART:20990105T200000Z",
          "DTEND:20990106T000000Z",
          "SUMMARY:Evening",
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
    expect(entries).toHaveLength(1);
    expect(entries[0].date.toUTC().toISODate()).toBe("2099-01-05");
  });

  it("only emits in-range days for an event starting before the window", async () => {
    // Event starts before the visible window and ends far in the future. Only
    // the days within the visible range should be produced.
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:uid-farfuture",
          "DTSTAMP:20000101T000000Z",
          "DTSTART;VALUE=DATE:20980101",
          "DTEND;VALUE=DATE:22200101",
          "SUMMARY:Long",
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
        params={{ start: "2099-01-01T00:00:00.000Z", end: "2099-01-04T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
        timezone="utc"
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const entries = Object.values(setEvents.mock.calls[0][0]({}));
    const days = entries.map((e) => e.date.toISODate()).sort();
    expect(days).toEqual(["2099-01-01", "2099-01-02", "2099-01-03", "2099-01-04"]);
  });

  it("does not iterate beyond the visible range for a far-future end date", async () => {
    // A single all-day event spanning ~120 years. The per-day expansion must be
    // bounded by the visible window, not the event's full duration, otherwise it
    // performs tens of thousands of wasted iterations.
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:uid-perf",
          "DTSTAMP:20000101T000000Z",
          "DTSTART;VALUE=DATE:20990101",
          "DTEND;VALUE=DATE:22200101",
          "SUMMARY:Forever",
          "END:VEVENT",
          "END:VCALENDAR",
          "",
        ].join("\n"),
      },
      error: undefined,
    });

    const compareSpy = vi.spyOn(ICAL.Time.prototype, "compare");

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

    // The visible window is ~31 days. Allow generous headroom for the range
    // overlap checks, but far below the ~44,000 iterations a full 120-year span
    // would require if the loop were not clipped to the range.
    expect(compareSpy.mock.calls.length).toBeLessThan(500);

    const entries = Object.values(setEvents.mock.calls[0][0]({}));
    expect(entries.length).toBeLessThanOrEqual(32);
  });

  it("emits a single day for a same-day timed event", async () => {
    // Start and end fall on the same calendar day, so the zero/negative-span
    // guard collapses the expansion to just the start day.
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:uid-sameday",
          "DTSTAMP:20990101T000000Z",
          "DTSTART:20990105T090000Z",
          "DTEND:20990105T093000Z",
          "SUMMARY:Standup",
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
    expect(entries).toHaveLength(1);
    expect(entries[0].date.toUTC().toISODate()).toBe("2099-01-05");
  });

  it("produces no entries for an event entirely outside the range", async () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:uid-outofrange",
          "DTSTAMP:20990101T000000Z",
          "DTSTART;VALUE=DATE:20990601",
          "DTEND;VALUE=DATE:20990603",
          "SUMMARY:Later",
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
    expect(entries).toHaveLength(0);
  });

  it("expands a multi-day recurring event across each day of every occurrence", async () => {
    // A weekly 3-day (DTEND exclusive) recurring event. Each weekly occurrence
    // within the range should contribute one entry per covered day.
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:uid-recur-multi",
          "DTSTAMP:20990101T000000Z",
          "RRULE:FREQ=WEEKLY;COUNT=2",
          "DTSTART;VALUE=DATE:20990105",
          "DTEND;VALUE=DATE:20990108",
          "SUMMARY:Workshop",
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
    // Week 1: Jan 5, 6, 7. Week 2: Jan 12, 13, 14.
    expect(days).toEqual(["2099-01-05", "2099-01-06", "2099-01-07", "2099-01-12", "2099-01-13", "2099-01-14"]);
  });

  it("emits a single day for a zero-length all-day event", async () => {
    // DTEND equals DTSTART. Treating the all-day DTEND as exclusive would step
    // the last day before the start, so the zero/negative-span guard clamps it
    // back to the start day (one entry).
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:uid-zerolen",
          "DTSTAMP:20990101T000000Z",
          "DTSTART;VALUE=DATE:20990105",
          "DTEND;VALUE=DATE:20990105",
          "SUMMARY:Marker",
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
    expect(entries).toHaveLength(1);
    expect(entries[0].date.toISODate()).toBe("2099-01-05");
  });

  it("marks a completed VTODO as completed", async () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VTODO",
          "UID:uid-todo",
          "DTSTAMP:20990101T000000Z",
          "DTSTART:20990105T090000Z",
          "DUE:20990105T100000Z",
          "STATUS:COMPLETED",
          "SUMMARY:Task",
          "END:VTODO",
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
    expect(entries).toHaveLength(1);
    expect(entries[0].isCompleted).toBe(true);
  });
});
