import { DateTime } from "luxon";
import { useEffect } from "react";

import useWidgetAPI from "../../../utils/proxy/use-widget-api";
import Error from "../../../components/services/widget/error";

export default function Integration({ config, params, setEvents, hideErrors = false }) {
  const { data: readarrData, error: readarrError } = useWidgetAPI(config, "calendar", {
    ...params,
    includeAuthor: "true",
    ...(config?.params ?? {}),
  });

  useEffect(() => {
    if (!readarrData || readarrError) {
      return;
    }

    const eventsToAdd = {};

    readarrData?.forEach((event) => {
      const authorName = event.author?.authorName ?? event.authorTitle.replace(event.title, "");
      const title = `${authorName} - ${event.title} ${event?.seriesTitle ? `(${event.seriesTitle})` : ""} `;

      eventsToAdd[title] = {
        title,
        date: DateTime.fromISO(event.releaseDate),
        color: config?.color ?? "rose",
        isCompleted: event.grabbed,
        additional: "",
      };
    });

    setEvents((prevEvents) => ({ ...prevEvents, ...eventsToAdd }));
  }, [readarrData, readarrError, config, setEvents]);

  const error = readarrError ?? readarrData?.error;
  return error && !hideErrors && <Error error={{ message: `${config.type}: ${error.message ?? error}` }} />;
}
