import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import { useMemo } from "react";

import useWidgetAPI from "utils/proxy/use-widget-api";

function getStartDate(interval) {
  const d = new Date();
  switch (interval) {
    case "day":
      d.setDate(d.getDate() - 1);
      break;
    case "week":
      d.setDate(d.getDate() - 7);
      break;
    case "month":
      d.setMonth(d.getMonth() - 1);
      break;
    case "year":
      d.setFullYear(d.getFullYear() - 1);
      break;
  }
  return d.toISOString();
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const interval = widget?.interval || "week";

  const date = useMemo(() => {
    return interval === "all" ? "2006-04-23T00:00:00.000Z" : getStartDate(interval);
  }, [interval]);

  const params = {
    timeSplit: "all",
    start: date,
  };

  const { data: songsListened, error: songsError } = useWidgetAPI(widget, "songs", params);
  const { data: timeListened, error: timeError } = useWidgetAPI(widget, "time", params);
  const { data: artistsListened, error: artistsError } = useWidgetAPI(widget, "artists", params);

  if (songsError || timeError || artistsError) {
    return <Container service={service} error={songsError ?? timeError ?? artistsError} />;
  }

  if (isNaN(songsListened) || isNaN(timeListened) || isNaN(artistsListened)) {
    return (
      <Container service={service}>
        <Block label="yourspotify.songs" />
        <Block label="yourspotify.time" />
        <Block label="yourspotify.artists" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="yourspotify.songs" value={t("common.number", { value: songsListened })} />

      <Block
        label="yourspotify.time"
        value={t(
          timeListened > 0 ? "common.duration" : "common.number", // Display 0 if duration is 0
          {
            value: timeListened / 1000,
          },
        )}
      />
      <Block label="yourspotify.artists" value={t("common.number", { value: artistsListened })} />
    </Container>
  );
}
