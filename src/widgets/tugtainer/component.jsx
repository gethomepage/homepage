import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

function getSummaryError(summaryData) {
  if (!summaryData) {
    return null;
  }

  if (!Array.isArray(summaryData) || summaryData.length === 0) {
    return { message: "Invalid data", data: summaryData };
  }

  const host = summaryData[0];
  if (typeof host?.total_containers !== "number" || typeof host?.by_status !== "object" || host?.by_status === null) {
    return { message: "Invalid data", data: summaryData };
  }

  return null;
}

function getUpdateCountError(updateCountData) {
  if (!updateCountData) {
    return null;
  }

  if (typeof updateCountData?.total_updates !== "number") {
    return { message: "Invalid data", data: updateCountData };
  }

  return null;
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: summaryData, error: summaryError } = useWidgetAPI(widget, "summary");
  const { data: updateCountData, error: updateCountError } = useWidgetAPI(widget, "update_count");

  const dataError = summaryError ?? updateCountError ?? getSummaryError(summaryData) ?? getUpdateCountError(updateCountData);
  if (dataError) {
    return <Container service={service} error={dataError} />;
  }

  if (!summaryData || !updateCountData) {
    return (
      <Container service={service}>
        <Block label="tugtainer.total_containers" />
        <Block label="tugtainer.running_containers" />
        <Block label="tugtainer.update_count" />
      </Container>
    );
  }

  const host = summaryData[0];

  return (
    <Container service={service}>
      <Block label="tugtainer.total_containers" value={t("common.number", { value: host.total_containers })} />
      <Block label="tugtainer.running_containers" value={t("common.number", { value: host.by_status.running ?? 0 })} />
      <Block label="tugtainer.update_count" value={t("common.number", { value: updateCountData.total_updates })} />
    </Container>
  );
}
