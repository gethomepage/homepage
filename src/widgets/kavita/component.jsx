import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: kavitaData, error: kavitaError } = useWidgetAPI(widget, "info");

  if (kavitaError) {
    return <Container service={service} error={kavitaError} />;
  }

  if (!kavitaData) {
    return (
      <Container service={service}>
        <Block label="kavita.seriesCount" />
        <Block label="kavita.totalFiles" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="kavita.seriesCount" value={t("common.number", { value: kavitaData.seriesCount })} />
      <Block label="kavita.totalFiles" value={t("common.number", { value: kavitaData.totalFiles })} />
    </Container>
  );
}
