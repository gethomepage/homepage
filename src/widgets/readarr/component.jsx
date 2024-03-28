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
    const finalError = booksError ?? wantedError ?? queueError;
    return <Container service={service} error={finalError} />;
  }

  if (!booksData || !wantedData || !queueData) {
    return (
      <Container service={service}>
        <Block label="readarr.wanted" />
        <Block label="readarr.queued" />
        <Block label="readarr.books" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="readarr.wanted" value={t("common.number", { value: wantedData.totalRecords })} />
      <Block label="readarr.queued" value={t("common.number", { value: queueData.totalCount })} />
      <Block label="readarr.books" value={t("common.number", { value: booksData.have })} />
    </Container>
  );
}
