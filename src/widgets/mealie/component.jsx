import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const version = widget.version ?? 1;
  const { data, error } = useWidgetAPI(widget, version === 1 ? "statisticsv1" : "statisticsv2");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="mealie.recipes" />
        <Block label="mealie.users" />
        <Block label="mealie.categories" />
        <Block label="mealie.tags" />
      </Container>
    );
  }
  return (
    <Container service={service}>
      <Block label="mealie.recipes" value={t("common.number", { value: data.totalRecipes })} />
      <Block label="mealie.users" value={t("common.number", { value: data.totalUsers })} />
      <Block label="mealie.categories" value={t("common.number", { value: data.totalCategories })} />
      <Block label="mealie.tags" value={t("common.number", { value: data.totalTags })} />
    </Container>
  );
}
