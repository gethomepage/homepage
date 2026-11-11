// @vitest-environment jsdom

import { render, screen, waitFor } from "@testing-library/react";
import ICAL from "ical.js";
import { describe, expect, it, vi } from "vitest";

const { useWidgetAPI } = vi.hoisted(() => ({
  useWidgetAPI: vi.fn(),
}));

vi.mock("utils/proxy/use-widget-api", () => ({ default: useWidgetAPI }));

import Integration, { toDateTime } from "./ical";

describe("widgets/calendar/integrations/ical", () => {
  it("reports a missing calendar payload without mutating the response", () => {
    const data = {};
    useWidgetAPI.mockReturnValue({ data, error: undefined });

    render(
      <Integration
        config={{ name: "Work", type: "ical" }}
        params={{ start: "2099-01-01", end: "2099-01-02" }}
        setEvents={vi.fn()}
        hideErrors={false}
        timezone="utc"
      />,
    );

    expect(screen.getByText(/'Work': calendar\.errorWhenLoadingData/)).toBeInTheDocument();
    expect(data).toEqual({});
  });

  it("reports a calendar with no events without mutating the response", () => {
    const data = {
      data: ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Test//EN", "END:VCALENDAR", ""].join("\n"),
    };
    const originalData = structuredClone(data);
    useWidgetAPI.mockReturnValue({ data, error: undefined });

    render(
      <Integration
        config={{ name: "Empty", type: "ical" }}
        params={{ start: "2099-01-01", end: "2099-01-02" }}
        setEvents={vi.fn()}
        hideErrors={false}
        timezone="utc"
      />,
    );

    expect(screen.getByText(/'Empty': calendar\.noEventsFound/)).toBeInTheDocument();
    expect(data).toEqual(originalData);
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

  it("folds RECURRENCE-ID overrides into the series instead of duplicating moved occurrences", async () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:series@test",
          "SUMMARY:Weekly test event",
          "DTSTART;TZID=America/New_York:20261106T104500",
          "DTEND;TZID=America/New_York:20261106T111000",
          "RRULE:FREQ=WEEKLY;WKST=SU;UNTIL=20261114T045959Z;INTERVAL=1;BYDAY=FR",
          "SEQUENCE:2",
          "END:VEVENT",
          "BEGIN:VEVENT",
          "UID:series@test",
          "SUMMARY:Weekly test event",
          "DTSTART;TZID=America/New_York:20261106T103000",
          "DTEND;TZID=America/New_York:20261106T105500",
          "RECURRENCE-ID;TZID=America/New_York:20261106T104500",
          "SEQUENCE:3",
          "END:VEVENT",
          "BEGIN:VEVENT",
          "UID:series@test",
          "SUMMARY:Weekly test event",
          "DTSTART;TZID=America/New_York:20261112T100000",
          "DTEND;TZID=America/New_York:20261112T102500",
          "RECURRENCE-ID;TZID=America/New_York:20261113T104500",
          "SEQUENCE:3",
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
        config={{ name: "Family", type: "ical", color: "blue" }}
        params={{ start: "2026-11-01T00:00:00.000Z", end: "2026-11-20T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
        timezone="America/New_York"
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const entries = Object.values(setEvents.mock.calls[0][0]({}));
    const times = entries.map((event) => event.date.toFormat("yyyy-MM-dd'T'HH:mm")).sort();

    // Each moved occurrence appears once, at its new time; the original 10:45 slot is gone
    expect(times).toEqual(["2026-11-06T10:30", "2026-11-12T10:00"]);
    expect(entries.every((event) => event.title === "Weekly test event")).toBe(true);
  });

  it("omits a recurring occurrence cancelled with EXDATE", async () => {
    useWidgetAPI.mockReturnValue({
      data: {
        data: [
          "BEGIN:VCALENDAR",
          "VERSION:2.0",
          "PRODID:-//Test//EN",
          "BEGIN:VEVENT",
          "UID:standup@test",
          "SUMMARY:Standup",
          "DTSTART;TZID=America/New_York:20261102T090000",
          "DTEND;TZID=America/New_York:20261102T091500",
          "RRULE:FREQ=DAILY;COUNT=3",
          "EXDATE;TZID=America/New_York:20261103T090000",
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
        config={{ name: "Work", type: "ical", color: "blue" }}
        params={{ start: "2026-11-01T00:00:00.000Z", end: "2026-11-10T00:00:00.000Z" }}
        setEvents={setEvents}
        hideErrors
        timezone="America/New_York"
      />,
    );

    await waitFor(() => expect(setEvents).toHaveBeenCalled());

    const entries = Object.values(setEvents.mock.calls[0][0]({}));
    expect(entries.map((event) => event.date.toUTC().toISODate()).sort()).toEqual(["2026-11-02", "2026-11-04"]);
  });

  it.each([
    ["winter TZID", "2026-10-27T14:00:00", "Europe/Berlin", "2026-10-27T06:00:00.000-07:00"],
    ["summer TZID", "2026-07-27T14:00:00", "Europe/Berlin", "2026-07-27T05:00:00.000-07:00"],
    ["UTC", "2026-10-27T01:00:00Z", undefined, "2026-10-26T18:00:00.000-07:00"],
    ["floating time", "2026-10-27T09:00:00", undefined, "2026-10-27T09:00:00.000-07:00"],
    ["all-day date", "2026-07-16", undefined, "2026-07-16T00:00:00.000-07:00"],
  ])("converts %s to the configured timezone", (_name, value, sourceTimezone, expected) => {
    const date = ICAL.Time.fromString(value);
    expect(toDateTime(date, "America/Los_Angeles", sourceTimezone).toISO()).toBe(expected);
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
    expect(entries.every((event) => event.date.zoneName === "America/Los_Angeles")).toBe(true);
  });
});
