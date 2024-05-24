import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { categoryId } = widget;

  console.log({categoryId});

  const { data: collections, error: statsError } = useWidgetAPI(widget, "collections");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!collections) {
    return (
      <Container service={service}>
        <Block label="overseerr.pending" />
        <Block label="overseerr.processing" />
        <Block label="overseerr.approved" />
        <Block label="overseerr.available" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="overseerr.pending" value={t("common.number", { value: collections.length })} />
    </Container>
  );
}
