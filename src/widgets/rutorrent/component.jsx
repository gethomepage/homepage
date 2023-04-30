import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statusData, error: statusError } = useWidgetAPI(widget);

  if (statusError) {
    return <Container service={service} error={statusError} />;
  }

  if (!statusData) {
    return (
      <Container service={service}>
        <Block label="rutorrent.active" />
        <Block label="rutorrent.upload" />
        <Block label="rutorrent.download" />
      </Container>
    );
  }

  const upload = statusData.reduce((acc, torrent) => acc + parseInt(torrent["d.get_up_rate"], 10), 0);

  const download = statusData.reduce((acc, torrent) => acc + parseInt(torrent["d.get_down_rate"], 10), 0);

  const active = statusData.filter((torrent) => torrent["d.get_state"] === "1");

  return (
    <Container service={service}>
      <Block label="rutorrent.active" value={active.length} />
      <Block label="rutorrent.upload" value={t("common.byterate", { value: upload })} />
      <Block label="rutorrent.download" value={t("common.byterate", { value: download })} />
    </Container>
  );
}
