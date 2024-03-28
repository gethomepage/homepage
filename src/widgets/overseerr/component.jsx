import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "request/count");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!statsData) {
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
      <Block label="overseerr.pending" value={t("common.number", { value: statsData.pending })} />
      <Block label="overseerr.processing" value={t("common.number", { value: statsData.processing })} />
      <Block label="overseerr.approved" value={t("common.number", { value: statsData.approved })} />
      <Block label="overseerr.available" value={t("common.number", { value: statsData.available })} />
    </Container>
  );
}
