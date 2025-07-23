import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const todayDate = new Date();
  const { t } = useTranslation();
  const { widget } = service;
  const { data: subscriptionsThisMonthlyCostData, error: subscriptionsThisMonthlyCostError } = useWidgetAPI(widget, "subscriptions/get_monthly_cost", {
    month: todayDate.getMonth(),
    year: todayDate.getFullYear()
  });
  const { data: subscriptionsNextMonthlyCostData, error: subscriptionsNextMonthlyCostError } = useWidgetAPI(widget, "subscriptions/get_monthly_cost", {
    month: todayDate.getMonth() + 1,
    year: todayDate.getFullYear()
  });

  if (subscriptionsThisMonthlyCostError || subscriptionsNextMonthlyCostError) {
    const finalError = subscriptionsThisMonthlyCostError ?? subscriptionsNextMonthlyCostError;
    return <Container service={service} error={finalError} />;
  }

  if (!subscriptionsThisMonthlyCostData || !subscriptionsNextMonthlyCostData) {
    return (
      <Container service={service}>
        <Block label="wallos.thisMonthlyCost" />
        <Block label="wallos.nextMonthlyCost" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="wallos.thisMonthlyCost" value={subscriptionsThisMonthlyCostData.localized_monthly_cost} />
      <Block label="wallos.nextMonthlyCost" value={subscriptionsNextMonthlyCostData.localized_monthly_cost} />
    </Container>
  );
}
