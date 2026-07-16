import ICAL from "ical.js";
import { DateTime } from "luxon";
import { useTranslation } from "next-i18next/pages";
import { useEffect } from "react";

import Error from "../../../components/services/widget/error";
import useWidgetAPI from "../../../utils/proxy/use-widget-api";

function simpleHash(str) {
  let hash = 0;
  const prime = 31;

  for (let i = 0; i < str.length; i++) {
    hash = (hash * prime + str.charCodeAt(i)) % 2_147_483_647;
  }

  return Math.abs(hash).toString(36);
}

export default function Integration({ config, params, setEvents, hideErrors, timezone }) {
  const { t } = useTranslation();
  const { data: icalData, error: icalError } = useWidgetAPI(config, config.name, {
    refreshInterval: 300000, // 5 minutes
  });

  useEffect(() => {
    const { showName = false } = config?.params || {};
    let events = [];

    if (!icalError && icalData && !icalData.error) {
      if (!icalData.data) {
        icalData.error = { message: `'${config.name}': ${t("calendar.errorWhenLoadingData")}` };
        return;
      }

      const jCal = ICAL.parse(icalData.data);
      const vCalendar = new ICAL.Component(jCal);

      const buildEvent = (event, type) => {
        return {
          id: event.getFirstPropertyValue("uid"),
          type,
          title: event.getFirstPropertyValue("summary"),
          rrule: event.getFirstPropertyValue("rrule"),
          dtstart:
            event.getFirstPropertyValue("dtstart") ||
            event.getFirstPropertyValue("due") ||
            event.getFirstPropertyValue("completed") ||
            ICAL.Time.now(), // handles events without a date
          dtend:
            event.getFirstPropertyValue("dtend") ||
            event.getFirstPropertyValue("due") ||
            event.getFirstPropertyValue("completed") ||
            ICAL.Time.now(), // handles events without a date
          location: event.getFirstPropertyValue("location"),
          status: event.getFirstPropertyValue("status"),
          url: event.getFirstPropertyValue("url"),
        };
      };

      const getEvents = () => {
        const vEvents = vCalendar.getAllSubcomponents("vevent").map((event) => buildEvent(event, "vevent"));

        const vTodos = vCalendar.getAllSubcomponents("vtodo").map((todo) => buildEvent(todo, "vtodo"));

        return [...vEvents, ...vTodos];
      };

      events = getEvents();
      if (events.length === 0) {
        icalData.error = { message: `'${config.name}': ${t("calendar.noEventsFound")}` };
      }
    }

    const startDate = DateTime.fromISO(params.start);
    const endDate = DateTime.fromISO(params.end);

    if (icalError || events.length === 0 || !startDate.isValid || !endDate.isValid) {
      return;
    }

    const rangeStart = ICAL.Time.fromJSDate(startDate.toJSDate());
    const rangeEnd = ICAL.Time.fromJSDate(endDate.toJSDate());

    // Expands a single (occurrence) start into one entry per day it spans,
    // clipped to the visible range. `duration` is the length of the event.
    // For all-day (date-only) events, DTEND is exclusive per the iCal spec,
    // so the last displayed day is the day before dtend.
    const expandDays = (start, duration, occurrences) => {
      // Compute the last covered instant, then normalize to day granularity so
      // the per-day loop and range clipping work identically for all-day and
      // timed events (downstream views compare at day granularity anyway).
      const end = start.clone();
      end.addDuration(duration);

      const startDay = start.clone();
      startDay.isDate = true;

      const lastDay = end.clone();
      lastDay.isDate = true;
      // A timed event ending exactly at midnight ends the instant the next day
      // begins, so that day is not actually covered by the event.
      const endsAtMidnight =
        !end.isDate && end.compare(start) > 0 && end.hour === 0 && end.minute === 0 && end.second === 0;

      if (start.isDate || endsAtMidnight) {
        // All-day events have an exclusive DTEND per the iCal spec; likewise a
        // midnight end is exclusive. Step back to the last day actually covered.
        lastDay.day -= 1;
      }
      // Guard against zero/negative spans (e.g. same-day timed events, where
      // truncating to day granularity leaves start === end): emit the start day.
      if (lastDay.compare(startDay) < 0) {
        lastDay.day = startDay.day;
        lastDay.month = startDay.month;
        lastDay.year = startDay.year;
      }

      const rangeStartDay = rangeStart.clone();
      rangeStartDay.isDate = true;
      const rangeEndDay = rangeEnd.clone();
      rangeEndDay.isDate = true;

      const firstDayNum = startDay.dayOfYear();
      const firstYear = startDay.year;
      // Clip the loop bounds to the visible range so iteration is bounded by the
      // window, not the (potentially very long) event duration. `isFirst` is
      // still compared against the true start day so the start time is only
      // emitted when the event's real first day is within view.
      const loopStart = startDay.compare(rangeStartDay) < 0 ? rangeStartDay.clone() : startDay;
      const loopEnd = lastDay.compare(rangeEndDay) > 0 ? rangeEndDay.clone() : lastDay;
      for (const day = loopStart; day.compare(loopEnd) <= 0; day.day += 1) {
        const isFirst = day.year === firstYear && day.dayOfYear() === firstDayNum;
        // Preserve the original start time on the first day so timed events keep
        // their time-of-day (used by the `showTime` option); subsequent days of
        // a multi-day event are represented as plain dates.
        occurrences.push(isFirst ? start.clone() : day.clone());
      }
    };

    const getOcurrencesFromRange = (event) => {
      const duration = event.dtend.subtractDate(event.dtstart);

      if (!event.rrule) {
        // Include the event if it overlaps the visible range at all.
        if (event.dtstart.compare(rangeEnd) <= 0 && event.dtend.compare(rangeStart) >= 0) {
          const occurrences = [];
          expandDays(event.dtstart, duration, occurrences);
          return occurrences;
        }

        return [];
      }

      const iterator = event.rrule.iterator(event.dtstart);

      const occurrences = [];
      for (let next = iterator.next(); next && next.compare(rangeEnd) < 0; next = iterator.next()) {
        // Each recurrence spans the same duration as the original event.
        const occurrenceEnd = next.clone();
        occurrenceEnd.addDuration(duration);
        if (occurrenceEnd.compare(rangeStart) < 0) {
          continue;
        }

        expandDays(next, duration, occurrences);
      }

      return occurrences;
    };

    const eventsToAdd = [];
    events.forEach((event) => {
      const occurrences = getOcurrencesFromRange(event);

      occurrences.forEach((icalDate) => {
        const date = icalDate.toJSDate();

        const occurrenceTimestamp = date.getTime();
        const eventIdentifier =
          event.id ??
          simpleHash(
            `${event.title ?? ""}-${event.type ?? ""}-${event.status ?? ""}-${event.url ?? ""}-${event.location ?? ""}`,
          );
        const hash = simpleHash(`${eventIdentifier}-${occurrenceTimestamp}`);

        let title = event.title;
        if (showName) {
          title = `${config.name}: ${title}`;
        }

        const getIsCompleted = () => {
          if (event.type === "vtodo") {
            return event.status === "COMPLETED";
          }

          return DateTime.fromJSDate(date) < DateTime.now();
        };

        eventsToAdd[hash] = {
          title,
          date: DateTime.fromJSDate(date),
          color: config?.color ?? "zinc",
          isCompleted: getIsCompleted(),
          additional: event.location,
          type: "ical",
          url: event.url,
        };
      });
    });

    setEvents((prevEvents) => ({ ...prevEvents, ...eventsToAdd }));
  }, [icalData, icalError, config, params, setEvents, timezone, t]);

  const error = icalError ?? icalData?.error;
  return error && !hideErrors && <Error error={{ message: `${config.type}: ${error.message ?? error}` }} />;
}
