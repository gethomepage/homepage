import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data, error } = useWidgetAPI(widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="backrest.num_plans" />
        <Block label="backrest.num_success" />
        <Block label="backrest.num_failure" />
        <Block label="backrest.bytes_added" />
      </Container>
    );
  }

  const plans = data.planSummaries;
  const numPlans = plans.length;

  // Number of successful runs in the last 30 days
  const numSuccess = plans
    .map((plan) => {
      const num = Number(plan.backupsSuccessLast30days);
      if (Number.isNaN(num)) return 0;
      return num;
    })
    .reduce((a, b) => a + b, 0);

  // Number of failed runs in the last 30 days
  const numFailure = plans
    .map((plan) => {
      const num = Number(plan.backupsFailed30days);
      if (Number.isNaN(num)) return 0;
      return num;
    })
    .reduce((a, b) => a + b, 0);

  // Total bytes added in the last 30 days
  const bytesAdded = plans
    .map((plan) => {
      const num = Number(plan.bytesAddedLast30days);
      if (Number.isNaN(num)) return 0;
      return num;
    })
    .reduce((a, b) => a + b, 0);

  return (
    <Container service={service}>
      <Block label="backrest.num_plans" value={t("common.number", { value: numPlans })} />
      <Block label="backrest.num_success" value={t("common.number", { value: numSuccess })} />
      <Block label="backrest.num_failure" value={t("common.number", { value: numFailure })} />
      <Block label="backrest.bytes_added" value={t("common.bytes", { value: bytesAdded })} />
    </Container>
  );
}


