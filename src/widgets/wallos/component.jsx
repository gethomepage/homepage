import { useTranslation } from "next-i18next";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const todayDate = new Date();
  const { t } = useTranslation();
  const { widget } = service;
  const { data: subscriptionsData, error: subscriptionsError } = useWidgetAPI(widget, "subscriptions/get_subscriptions", {
    state: 0,
    sort: "price",
  });
  const { data: subscriptionsThisMonthlyCostData, error: subscriptionsThisMonthlyCostError } = useWidgetAPI(widget, "subscriptions/get_monthly_cost", {
    month: todayDate.getMonth(),
    year: todayDate.getFullYear(),
  });
  const { data: subscriptionsNextMonthlyCostData, error: subscriptionsNextMonthlyCostError } = useWidgetAPI(widget, "subscriptions/get_monthly_cost", {
    month: todayDate.getMonth() + 1,
    year: todayDate.getFullYear(),
  });
  const { data: subscriptionsPreviousMonthlyCostData, error: subscriptionsPreviousMonthlyCostError } = useWidgetAPI(widget, "subscriptions/get_monthly_cost", {
    month: todayDate.getMonth() - 1,
    year: todayDate.getFullYear(),
  });

  if (subscriptionsError || subscriptionsThisMonthlyCostError || subscriptionsNextMonthlyCostError || subscriptionsPreviousMonthlyCostError) {
    const finalError = subscriptionsError ?? subscriptionsThisMonthlyCostError ?? subscriptionsNextMonthlyCostError ?? subscriptionsPreviousMonthlyCostError;
    return <Container service={service} error={finalError} />;
  }

  if (!subscriptionsData || !subscriptionsThisMonthlyCostData || !subscriptionsNextMonthlyCostData || !subscriptionsPreviousMonthlyCostData) {
    return (
      <Container service={service}>
        <Block label="wallos.activeSubscriptions" />
        <Block label="wallos.previousMonthlyCost" />
        <Block label="wallos.thisMonthlyCost" />
        <Block label="wallos.nextMonthlyCost" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="wallos.activeSubscriptions" value={t("common.number", { value: subscriptionsData.subscriptions?.length })} />
      <Block label="wallos.previousMonthlyCost" value={subscriptionsPreviousMonthlyCostData.localized_monthly_cost} />
      <Block label="wallos.thisMonthlyCost" value={subscriptionsThisMonthlyCostData.localized_monthly_cost} />
      <Block label="wallos.nextMonthlyCost" value={subscriptionsNextMonthlyCostData.localized_monthly_cost} />
    </Container>
  );
}
