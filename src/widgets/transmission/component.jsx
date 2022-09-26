import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: torrentData, error: torrentError } = useSWR(formatProxyUrl(config));

  if (torrentError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!torrentData) {
    return (
      <Container>
        <Block label={t("transmission.leech")} />
        <Block label={t("transmission.download")} />
        <Block label={t("transmission.seed")} />
        <Block label={t("transmission.upload")} />
      </Container>
    );
  }

  const { torrents } = torrentData.arguments;
  let rateDl = 0;
  let rateUl = 0;
  let completed = 0;

  for (let i = 0; i < torrents.length; i += 1) {
    const torrent = torrents[i];
    rateDl += torrent.rateDownload;
    rateUl += torrent.rateUpload;
    if (torrent.percentDone === 1) {
      completed += 1;
    }
  }

  const leech = torrents.length - completed;

  let unitsDl = "KB/s";
  let unitsUl = "KB/s";
  rateDl /= 1024;
  rateUl /= 1024;

  if (rateDl > 1024) {
    rateDl /= 1024;
    unitsDl = "MB/s";
  }

  if (rateUl > 1024) {
    rateUl /= 1024;
    unitsUl = "MB/s";
  }

  return (
    <Container>
      <Block label={t("transmission.leech")} value={t("common.number", { value: leech })} />
      <Block label={t("transmission.download")} value={`${rateDl.toFixed(2)} ${unitsDl}`} />
      <Block label={t("transmission.seed")} value={t("common.number", { value: completed })} />
      <Block label={t("transmission.upload")} value={`${rateUl.toFixed(2)} ${unitsUl}`} />
    </Container>
  );
}
