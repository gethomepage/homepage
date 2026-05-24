import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const range = widget.range ?? 86400;

  const { data: countData, error: countError } = useWidgetAPI(widget, "count", {
    query: "*",
    range,
    limit: 1,
  });
  const { data: throughputData, error: throughputError } = useWidgetAPI(widget, "throughput");
  const { data: notificationsData, error: notificationsError } = useWidgetAPI(widget, "notifications");

  const error = countError ?? throughputError ?? notificationsError;

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!countData || !throughputData || !notificationsData) {
    return (
      <Container service={service}>
        <Block label="graylog.messages" />
        <Block label="graylog.throughput" />
        <Block label="graylog.notifications" />
      </Container>
    );
  }

  const inputMetric = throughputData.metrics?.find((m) => m.full_name?.includes("input.1-sec-rate"));
  const throughputValue = Math.round(inputMetric?.metric?.value ?? 0);

  return (
    <Container service={service}>
      <Block label="graylog.messages" value={t("common.number", { value: countData.total_results })} />
      <Block label="graylog.throughput" value={t("common.number", { value: throughputValue })} />
      <Block label="graylog.notifications" value={t("common.number", { value: notificationsData.total })} />
    </Container>
  );
}
