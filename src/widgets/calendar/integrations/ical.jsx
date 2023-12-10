import { DateTime } from "luxon";
import { parseString } from "cal-parser";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";
import { RRule } from "rrule";

import useWidgetAPI from "../../../utils/proxy/use-widget-api";
import Error from "../../../components/services/widget/error";

export default function Integration({ config, params, setEvents, hideErrors }) {
  const { t } = useTranslation();
  const { data: icalData, error: icalError } = useWidgetAPI(config, config.name, {
    refreshInterval: 300000, // 5 minutes
  });

  useEffect(() => {
    let parsedIcal;

    if (!icalError && icalData && !icalData.error) {
      parsedIcal = parseString(icalData.data);
      if (parsedIcal.events.length === 0) {
        icalData.error = { message: `'${config.name}': ${t("calendar.noEventsFound")}` };
      }
    }

    const startDate = DateTime.fromISO(params.start);
    const endDate = DateTime.fromISO(params.end);

    if (icalError || !parsedIcal || !startDate.isValid || !endDate.isValid) {
      return;
    }

    const eventsToAdd = {};
    const events = parsedIcal?.getEventsBetweenDates(startDate.toJSDate(), endDate.toJSDate());

    events?.forEach((event) => {
      let title = `${event?.summary?.value}`;
      if (config?.params?.showName) {
        title = `${config.name}: ${title}`;
      }

      const eventToAdd = (date, i, type) => {
        const duration = event.dtend.value - event.dtstart.value;
        const days = duration / (1000 * 60 * 60 * 24);

        for (let j = 0; j < days; j += 1) {
          eventsToAdd[`${event?.uid?.value}${i}${j}${type}`] = {
            title,
            date: DateTime.fromJSDate(date).plus({ days: j }),
            color: config?.color ?? "zinc",
            isCompleted: DateTime.fromJSDate(date) < DateTime.now(),
            additional: event.location?.value,
            type: "ical",
          };
        }
      };

      if (event?.recurrenceRule?.options) {
        const rule = new RRule(event.recurrenceRule.options);
        const recurringEvents = rule.between(startDate.toJSDate(), endDate.toJSDate());

        recurringEvents.forEach((date, i) => eventToAdd(date, i, "recurring"));
        return;
      }

      event.matchingDates.forEach((date, i) => eventToAdd(date, i, "single"));
    });

    setEvents((prevEvents) => ({ ...prevEvents, ...eventsToAdd }));
  }, [icalData, icalError, config, params, setEvents, t]);

  const error = icalError ?? icalData?.error;
  return error && !hideErrors && <Error error={{ message: `${config.type}: ${error.message ?? error}` }} />;
}
