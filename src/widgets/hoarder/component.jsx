import { useTranslation } from "next-i18next";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats");

  if (statsError) {
    const finalError = statsError;
    return <Container service={service} error={finalError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="hoarder.bookmarks" />
        <Block label="hoarder.favorites" />
        <Block label="hoarder.archived" />
        <Block label="hoarder.highlights" />
        <Block label="hoarder.lists" />
        <Block label="hoarder.tags" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="hoarder.bookmarks" value={t("common.number", { value: statsData.numBookmarks })} />
      <Block label="hoarder.favorites" value={t("common.number", { value: statsData.numFavorites })} />
      <Block label="hoarder.archived" value={t("common.number", { value: statsData.numArchived })} />
      <Block label="hoarder.highlights" value={t("common.number", { value: statsData.numHighlights })} />
      <Block label="hoarder.lists" value={t("common.number", { value: statsData.numLists })} />
      <Block label="hoarder.tags" value={t("common.number", { value: statsData.numTags })} />
    </Container>
  );
}
