import { DateTime } from "luxon";
import { parseString } from "cal-parser";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";

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

    if (icalError || !parsedIcal) {
      return;
    }

    const eventsToAdd = {};
    const events = parsedIcal?.getEventsBetweenDates(
      DateTime.fromISO(params.start).toJSDate(),
      DateTime.fromISO(params.end).toJSDate(),
    );

    events?.forEach((event) => {
      let title = `${event?.summary?.value}`;
      if (config?.params?.showName) {
        title = `${config.name}: ${title}`;
      }

      event.matchingDates.forEach((date) => {
        eventsToAdd[event?.uid?.value] = {
          title,
          date: DateTime.fromJSDate(date),
          color: config?.color ?? "zinc",
          isCompleted: DateTime.fromJSDate(date) < DateTime.now(),
          additional: event.location?.value,
          type: "ical",
        };
      });
    });

    setEvents((prevEvents) => ({ ...prevEvents, ...eventsToAdd }));
  }, [icalData, icalError, config, params, setEvents, t]);

  const error = icalError ?? icalData?.error;
  return error && !hideErrors && <Error error={{ message: `${config.type}: ${error.message ?? error}` }} />;
}
