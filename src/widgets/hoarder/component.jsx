import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: bookmarksData, error: bookmarksError } = useWidgetAPI(widget, "bookmarks");
  const { data: notesData, error: notesError } = useWidgetAPI(widget, "notes");

  if (bookmarksError || notesError) {
    const finalError = bookmarksError ?? notesError;
    return <Container service={service} error={finalError} />;
  }

  if (!bookmarksData || !notesData) {
    return (
      <Container service={service}>
        <Block label="hoarder.bookmarks" />
        <Block label="hoarder.notes" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="hoarder.bookmarks" value={t("common.number", { value: bookmarksData.length })} />
      <Block label="hoarder.notes" value={t("common.number", { value: notesData.length })} />
    </Container>
  );
}
