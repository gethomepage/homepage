import { DateTime } from "luxon";
import { useEffect } from "react";

import useWidgetAPI from "../../../utils/proxy/use-widget-api";
import Error from "../../../components/services/widget/error";

export default function Integration({ config, params, setEvents, hideErrors = false }) {
  const { data: lidarrData, error: lidarrError } = useWidgetAPI(config, "calendar", {
    ...params,
    includeArtist: "false",
    ...(config?.params ?? {}),
  });

  useEffect(() => {
    if (!lidarrData || lidarrError) {
      return;
    }

    const eventsToAdd = {};

    lidarrData?.forEach((event) => {
      const title = `${event.artist.artistName} - ${event.title}`;

      eventsToAdd[title] = {
        title,
        date: DateTime.fromISO(event.releaseDate),
        color: config?.color ?? "green",
        isCompleted: event.grabbed,
        additional: "",
      };
    });

    setEvents((prevEvents) => ({ ...prevEvents, ...eventsToAdd }));
  }, [lidarrData, lidarrError, config, setEvents]);

  const error = lidarrError ?? lidarrData?.error;
  return error && !hideErrors && <Error error={{ message: `${config.type}: ${error.message ?? error}` }} />;
}
