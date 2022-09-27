import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statusData, error: statusError } = useWidgetAPI(widget);

  if (statusError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!statusData) {
    return (
      <Container>
        <Block label={t("rutorrent.active")} />
        <Block label={t("rutorrent.upload")} />
        <Block label={t("rutorrent.download")} />
      </Container>
    );
  }

  const upload = statusData.reduce((acc, torrent) => acc + parseInt(torrent["d.get_up_rate"], 10), 0);

  const download = statusData.reduce((acc, torrent) => acc + parseInt(torrent["d.get_down_rate"], 10), 0);

  const active = statusData.filter((torrent) => torrent["d.get_state"] === "1");

  return (
    <Container>
      <Block label={t("rutorrent.active")} value={active.length} />
      <Block label={t("rutorrent.upload")} value={t("common.bitrate", { value: upload })} />
      <Block label={t("rutorrent.download")} value={t("common.bitrate", { value: download })} />
    </Container>
  );
}
