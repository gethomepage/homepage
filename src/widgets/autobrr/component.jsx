import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats");
  const { data: filtersData, error: filtersError } = useWidgetAPI(widget, "filters");
  const { data: indexersData, error: indexersError } = useWidgetAPI(widget, "indexers");

  if (statsError || filtersError || indexersError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!statsData || !filtersData || !indexersData) {
    return (
      <Container service={service}>
        <Block label="autobrr.approvedPushes" />
        <Block label="autobrr.rejectedPushes" />
        <Block label="autobrr.filters" />
        <Block label="autobrr.indexers" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="autobrr.approvedPushes" value={t("common.number", { value: statsData.push_approved_count })} />
      <Block label="autobrr.rejectedPushes" value={t("common.number", { value: statsData.push_rejected_count })} />
      <Block label="autobrr.filters" value={t("common.number", { value: filtersData.length })} />
      <Block label="autobrr.indexers" value={t("common.number", { value: indexersData.length })} />
    </Container>
  );
}
