import { DateTime } from "luxon";
import { useEffect } from "react";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "../../../utils/proxy/use-widget-api";
import Error from "../../../components/services/widget/error";

export default function Integration({ config, params, setEvents, hideErrors = false }) {
  const { t } = useTranslation();
  const { data: radarrData, error: radarrError } = useWidgetAPI(config, "calendar", {
    ...params,
    ...(config?.params ?? {}),
  });
  useEffect(() => {
    if (!radarrData || radarrError) {
      return;
    }

    const eventsToAdd = {};

    radarrData?.forEach((event) => {
      const cinemaTitle = `${event.title} - ${t("calendar.inCinemas")}`;
      const physicalTitle = `${event.title} - ${t("calendar.physicalRelease")}`;
      const digitalTitle = `${event.title} - ${t("calendar.digitalRelease")}`;

      if (event.inCinemas) {
        eventsToAdd[cinemaTitle] = {
          title: cinemaTitle,
          date: DateTime.fromISO(event.inCinemas),
          color: config?.color ?? "amber",
          isCompleted: event.hasFile,
          additional: "",
        };
      }

      if (event.physicalRelease) {
        eventsToAdd[physicalTitle] = {
          title: physicalTitle,
          date: DateTime.fromISO(event.physicalRelease),
          color: config?.color ?? "cyan",
          isCompleted: event.hasFile,
          additional: "",
        };
      }

      if (event.digitalRelease) {
        eventsToAdd[digitalTitle] = {
          title: digitalTitle,
          date: DateTime.fromISO(event.digitalRelease),
          color: config?.color ?? "emerald",
          isCompleted: event.hasFile,
          additional: "",
        };
      }
    });

    setEvents((prevEvents) => ({ ...prevEvents, ...eventsToAdd }));
  }, [radarrData, radarrError, config, setEvents, t]);

  const error = radarrError ?? radarrData?.error;
  return error && !hideErrors && <Error error={{ message: `${config.type}: ${error.message ?? error}` }} />;
}
