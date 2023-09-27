import { DateTime } from "luxon";
import { useContext, useEffect } from "react";

import useWidgetAPI from "../../../utils/proxy/use-widget-api";
import { EventContext } from "../../../utils/contexts/calendar";
import Error from "../../../components/services/widget/error";

export default function Integration({ config, params }) {
  const { setEvents } = useContext(EventContext);
  const { data: lidarrData, error: lidarrError } = useWidgetAPI(config, "calendar",
    { ...params, includeArtist: 'false', ...config?.params ?? {} }
  );

  useEffect(() => {
    if (!lidarrData || lidarrError) {
      return;
    }

    const eventsToAdd = {};

    lidarrData?.forEach(event => {
      const title = `${event.artist.artistName} - ${event.title}`;

      eventsToAdd[title] = {
        title,
        date: DateTime.fromISO(event.releaseDate),
        color: config?.color ?? 'green'
      };
    })

    setEvents((prevEvents) => ({ ...prevEvents, ...eventsToAdd }));
  }, [lidarrData, lidarrError, config, setEvents]);

  const error = lidarrError ?? lidarrData?.error;
  return error && <Error error={{ message: `${config.type}: ${error.message ?? error}`}} />
}
