import ICAL from "ical.js";
import { DateTime } from "luxon";
import { useTranslation } from "next-i18next/pages";
import { useEffect, useMemo } from "react";

import Error from "../../../components/services/widget/error";
import useWidgetAPI from "../../../utils/proxy/use-widget-api";

export function toDateTime(icalDate, timezone, sourceTimezone) {
  const zone = timezone || "local";
  if (!icalDate.isDate && icalDate.zone.tzid !== "floating") {
    return DateTime.fromJSDate(icalDate.toJSDate(), { zone });
  }

  // Handle missing VTIMEZONE
  const value = icalDate.toString();
  const sourceZone = icalDate.isDate ? zone : sourceTimezone || zone;
  const date = DateTime.fromISO(value, { zone: sourceZone });
  if (!date.isValid) {
    return DateTime.fromISO(value, { zone });
  }
  return date.setZone(zone);
}

function simpleHash(str) {
  let hash = 0;
  const prime = 31;

  for (let i = 0; i < str.length; i++) {
    hash = (hash * prime + str.charCodeAt(i)) % 2_147_483_647;
  }

  return Math.abs(hash).toString(36);
}

function buildEvent(event, type) {
  const startProperty =
    event.getFirstProperty("dtstart") || event.getFirstProperty("due") || event.getFirstProperty("completed");

  return {
    id: event.getFirstPropertyValue("uid"),
    type,
    title: event.getFirstPropertyValue("summary"),
    rrule: event.getFirstPropertyValue("rrule"),
    dtstart: startProperty?.getFirstValue() || ICAL.Time.now(), // handles events without a date
    sourceTimezone: startProperty?.getParameter("tzid"),
    dtend:
      event.getFirstPropertyValue("dtend") ||
      event.getFirstPropertyValue("due") ||
      event.getFirstPropertyValue("completed") ||
      ICAL.Time.now(), // handles events without a date
    location: event.getFirstPropertyValue("location"),
    status: event.getFirstPropertyValue("status"),
    url: event.getFirstPropertyValue("url"),
  };
}

export default function Integration({ config, params, setEvents, hideErrors, timezone }) {
  const { t } = useTranslation();
  const { data: icalData, error: icalError } = useWidgetAPI(config, config.name, {
    refreshInterval: 300000, // 5 minutes
  });

  const { events, dataError } = useMemo(() => {
    if (icalError || !icalData || icalData.error) {
      return { events: [], dataError: undefined };
    }

    if (!icalData.data) {
      return {
        events: [],
        dataError: { message: `'${config.name}': ${t("calendar.errorWhenLoadingData")}` },
      };
    }

    const jCal = ICAL.parse(icalData.data);
    const vCalendar = new ICAL.Component(jCal);

    // Use RECURRENCE-ID to keep track of exceptions and relate them to their recurring master events
    const recurringMasters = new Map();
    const exceptionEvents = [];
    const plainComponents = [];
    vCalendar.getAllSubcomponents("vevent").forEach((component) => {
      const icalEvent = new ICAL.Event(component);
      if (icalEvent.isRecurrenceException()) {
        exceptionEvents.push(icalEvent);
      } else if (icalEvent.isRecurring()) {
        recurringMasters.set(icalEvent.uid, icalEvent);
      } else {
        plainComponents.push(component);
      }
    });
    exceptionEvents.forEach((exception) => {
      const master = recurringMasters.get(exception.uid);
      if (master) {
        master.relateException(exception);
      } else {
        plainComponents.push(exception.component); // e.g. override so show on its own
      }
    });

    const parsedEvents = [
      ...[...recurringMasters.values()].map((icalEvent) => ({
        ...buildEvent(icalEvent.component, "vevent"),
        recurringEvent: icalEvent,
      })),
      ...plainComponents.map((component) => buildEvent(component, "vevent")),
      ...vCalendar.getAllSubcomponents("vtodo").map((todo) => buildEvent(todo, "vtodo")),
    ];

    return {
      events: parsedEvents,
      dataError:
        parsedEvents.length === 0 ? { message: `'${config.name}': ${t("calendar.noEventsFound")}` } : undefined,
    };
  }, [icalData, icalError, config.name, t]);

  useEffect(() => {
    const { showName = false } = config?.params || {};

    const startDate = DateTime.fromISO(params.start);
    const endDate = DateTime.fromISO(params.end);

    if (events.length === 0 || !startDate.isValid || !endDate.isValid) {
      return;
    }

    const rangeStart = ICAL.Time.fromJSDate(startDate.toJSDate());
    const rangeEnd = ICAL.Time.fromJSDate(endDate.toJSDate());

    const getOcurrencesFromRange = (event) => {
      // Get all occurrences of the event within the specified range, including moved instances (exceptions)
      if (event.recurringEvent) {
        const iterator = event.recurringEvent.iterator();

        const occurrences = [];
        for (let next = iterator.next(); next && next.compare(rangeEnd) < 0; next = iterator.next()) {
          const { startDate: start } = event.recurringEvent.getOccurrenceDetails(next);
          if (start.compare(rangeStart) >= 0 && start.compare(rangeEnd) < 0) {
            occurrences.push(start);
          }
        }

        return occurrences;
      }

      if (!event.rrule) {
        if (event.dtstart.compare(rangeStart) >= 0 && event.dtend.compare(rangeEnd) <= 0) {
          if (event.type === "vevent" && event.dtstart.isDate && event.dtend.isDate) {
            const occurrences = [];
            for (const date = event.dtstart.clone(); date.compare(event.dtend) < 0; date.day += 1) {
              occurrences.push(date.clone());
            }
            return occurrences;
          }

          return [event.dtstart];
        }

        return [];
      }

      const iterator = event.rrule.iterator(event.dtstart);

      const occurrences = [];
      for (let next = iterator.next(); next && next.compare(rangeEnd) < 0; next = iterator.next()) {
        if (next.compare(rangeStart) < 0) {
          continue;
        }

        occurrences.push(next.clone());
      }

      return occurrences;
    };

    const eventsToAdd = {};
    events.forEach((event) => {
      const occurrences = getOcurrencesFromRange(event);

      occurrences.forEach((icalDate) => {
        const eventDate = toDateTime(icalDate, timezone, event.sourceTimezone);

        const occurrenceTimestamp = icalDate.toJSDate().getTime();
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

          return eventDate < DateTime.now();
        };

        eventsToAdd[hash] = {
          title,
          date: eventDate,
          color: config?.color ?? "zinc",
          isCompleted: getIsCompleted(),
          additional: event.location,
          type: "ical",
          url: event.url,
        };
      });
    });

    setEvents((prevEvents) => ({ ...prevEvents, ...eventsToAdd }));
  }, [events, config, params, setEvents, timezone]);

  const error = icalError ?? icalData?.error ?? dataError;
  return error && !hideErrors && <Error error={{ message: `${config.type}: ${error.message ?? error}` }} />;
}
