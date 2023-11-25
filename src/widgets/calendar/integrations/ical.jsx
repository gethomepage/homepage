import { DateTime } from "luxon";
import { parseString } from "cal-parser";
import { useEffect } from "react";

import useWidgetAPI from "../../../utils/proxy/use-widget-api";
import Error from "../../../components/services/widget/error";

export default function Integration({ config, params, setEvents, hideErrors }) {
  const { data: icalData, error: icalError } = useWidgetAPI(config, config.name, {
    refreshInterval: 300000, // 5 minutes
  });

  useEffect(() => {
    if (!icalData || icalError || !params) {
      return;
    }

    const eventsToAdd = {};
    const parsedIcal = parseString(icalData.data);
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
  }, [icalData, icalError, config, params, setEvents]);

  const error = icalError ?? icalData?.error;
  return error && !hideErrors && <Error error={{ message: `${config.type}: ${error.message ?? error}` }} />;
}
