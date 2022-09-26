import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: booksData, error: booksError } = useSWR(formatProxyUrl(config, "book"));
  const { data: wantedData, error: wantedError } = useSWR(formatProxyUrl(config, "wanted/missing"));
  const { data: queueData, error: queueError } = useSWR(formatProxyUrl(config, "queue/status"));

  if (booksError || wantedError || queueError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!booksData || !wantedData || !queueData) {
    return (
      <Container>
        <Block label={t("readarr.wanted")} />
        <Block label={t("readarr.queued")} />
        <Block label={t("readarr.books")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block label={t("readarr.wanted")} value={t("common.number", { value: wantedData.totalRecords })} />
      <Block label={t("readarr.queued")} value={t("common.number", { value: queueData.totalCount })} />
      <Block label={t("readarr.books")} value={t("common.number", { value: booksData.have })} />
    </Container>
  );
}
