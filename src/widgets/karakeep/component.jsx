import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

export const karakeepDefaultFields = ["bookmarks", "favorites", "archived", "highlights"];
const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();
  const service = withWidgetFields(configuredService, karakeepDefaultFields, MAX_ALLOWED_FIELDS);
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="karakeep.bookmarks" />
        <Block label="karakeep.favorites" />
        <Block label="karakeep.archived" />
        <Block label="karakeep.highlights" />
        <Block label="karakeep.lists" />
        <Block label="karakeep.tags" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="karakeep.bookmarks" value={t("common.number", { value: statsData.numBookmarks })} />
      <Block label="karakeep.favorites" value={t("common.number", { value: statsData.numFavorites })} />
      <Block label="karakeep.archived" value={t("common.number", { value: statsData.numArchived })} />
      <Block label="karakeep.highlights" value={t("common.number", { value: statsData.numHighlights })} />
      <Block label="karakeep.lists" value={t("common.number", { value: statsData.numLists })} />
      <Block label="karakeep.tags" value={t("common.number", { value: statsData.numTags })} />
    </Container>
  );
}
