import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Widget from "components/services/widgets/widget";
import Block from "components/services/widgets/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: booksData, error: booksError } = useSWR(formatProxyUrl(config, "book"));
  const { data: wantedData, error: wantedError } = useSWR(formatProxyUrl(config, "wanted/missing"));
  const { data: queueData, error: queueError } = useSWR(formatProxyUrl(config, "queue/status"));

  if (booksError || wantedError || queueError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!booksData || !wantedData || !queueData) {
    return (
      <Widget>
        <Block label={t("readarr.wanted")} />
        <Block label={t("readarr.queued")} />
        <Block label={t("readarr.books")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("readarr.wanted")} value={t("common.number", { value: wantedData.totalRecords })} />
      <Block label={t("readarr.queued")} value={t("common.number", { value: queueData.totalCount })} />
      <Block label={t("readarr.books")} value={t("common.number", { value: booksData.have })} />
    </Widget>
  );
}
