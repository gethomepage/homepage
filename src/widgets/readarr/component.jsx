import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: booksData, error: booksError } = useWidgetAPI(widget, "book");
  const { data: wantedData, error: wantedError } = useWidgetAPI(widget, "wanted/missing");
  const { data: queueData, error: queueError } = useWidgetAPI(widget, "queue/status");

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
