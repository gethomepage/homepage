import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: torrentData, error: torrentError } = useWidgetAPI(widget);

  if (torrentError) {
    return <Container service={service} error={torrentError} />;
  }

  if (!torrentData) {
    return (
      <Container service={service}>
        <Block label="transmission.leech" />
        <Block label="transmission.download" />
        <Block label="transmission.seed" />
        <Block label="transmission.upload" />
      </Container>
    );
  }

  const { torrents } = torrentData.arguments;

  const rateDl = torrents.reduce((acc, torrent) => acc + torrent.rateDownload, 0);
  const rateUl = torrents.reduce((acc, torrent) => acc + torrent.rateUpload, 0);
  const completed = torrents.filter((torrent) => torrent.percentDone === 1)?.length || 0;
  const leech = torrents.length - completed || 0;

  return (
    <Container service={service}>
      <Block label="transmission.leech" value={t("common.number", { value: leech })} />
      <Block label="transmission.download" value={t("common.byterate", { value: rateDl })} />
      <Block label="transmission.seed" value={t("common.number", { value: completed })} />
      <Block label="transmission.upload" value={t("common.byterate", { value: rateUl })} />
    </Container>
  );
}
