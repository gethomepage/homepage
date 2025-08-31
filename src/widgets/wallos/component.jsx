import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const todayDate = new Date();
  const { t } = useTranslation();
  const { widget } = service;

  if (!widget.fields) {
    widget.fields = ["activeSubscriptions", "nextRenewingSubscription", "thisMonthlyCost", "nextMonthlyCost"];
  } else if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  const subscriptionsEndPoint =
    widget.fields.includes("activeSubscriptions") || widget.fields.includes("nextRenewingSubscription")
      ? "get_subscriptions"
      : "";
  const { data: subscriptionsData, error: subscriptionsError } = useWidgetAPI(widget, subscriptionsEndPoint, {
    state: 0,
    sort: "next_payment",
  });
  const subscriptionsThisMonthlyEndpoint = widget.fields.includes("thisMonthlyCost") ? "get_monthly_cost" : "";
  const { data: subscriptionsThisMonthlyCostData, error: subscriptionsThisMonthlyCostError } = useWidgetAPI(
    widget,
    subscriptionsThisMonthlyEndpoint,
    {
      month: todayDate.getMonth(),
      year: todayDate.getFullYear(),
    },
  );
  const subscriptionsNextMonthlyEndpoint = widget.fields.includes("nextMonthlyCost") ? "get_monthly_cost" : "";
  const { data: subscriptionsNextMonthlyCostData, error: subscriptionsNextMonthlyCostError } = useWidgetAPI(
    widget,
    subscriptionsNextMonthlyEndpoint,
    {
      month: todayDate.getMonth() + 1,
      year: todayDate.getFullYear(),
    },
  );
  const subscriptionsPreviousMonthlyEndpoint = widget.fields.includes("previousMonthlyCost") ? "get_monthly_cost" : "";
  const { data: subscriptionsPreviousMonthlyCostData, error: subscriptionsPreviousMonthlyCostError } = useWidgetAPI(
    widget,
    subscriptionsPreviousMonthlyEndpoint,
    {
      month: todayDate.getMonth() - 1,
      year: todayDate.getFullYear(),
    },
  );

  if (
    subscriptionsError ||
    subscriptionsThisMonthlyCostError ||
    subscriptionsNextMonthlyCostError ||
    subscriptionsPreviousMonthlyCostError
  ) {
    const finalError =
      subscriptionsError ??
      subscriptionsThisMonthlyCostError ??
      subscriptionsNextMonthlyCostError ??
      subscriptionsPreviousMonthlyCostError;
    return <Container service={service} error={finalError} />;
  }

  if (
    (!subscriptionsData &&
      (widget.fields.includes("activeSubscriptions") || widget.fields.includes("nextRenewingSubscription"))) ||
    (!subscriptionsThisMonthlyCostData && widget.fields.includes("thisMonthlyCost")) ||
    (!subscriptionsNextMonthlyCostData && widget.fields.includes("nextMonthlyCost")) ||
    (!subscriptionsPreviousMonthlyCostData && widget.fields.includes("previousMonthlyCost"))
  ) {
    return (
      <Container service={service}>
        <Block label="wallos.activeSubscriptions" />
        <Block label="wallos.nextRenewingSubscription" />
        <Block label="wallos.previousMonthlyCost" />
        <Block label="wallos.thisMonthlyCost" />
        <Block label="wallos.nextMonthlyCost" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block
        label="wallos.activeSubscriptions"
        value={t("common.number", { value: subscriptionsData?.subscriptions?.length })}
      />
      <Block label="wallos.nextRenewingSubscription" value={subscriptionsData?.subscriptions[0]?.name} />
      <Block label="wallos.previousMonthlyCost" value={subscriptionsPreviousMonthlyCostData?.localized_monthly_cost} />
      <Block label="wallos.thisMonthlyCost" value={subscriptionsThisMonthlyCostData?.localized_monthly_cost} />
      <Block label="wallos.nextMonthlyCost" value={subscriptionsNextMonthlyCostData?.localized_monthly_cost} />
    </Container>
  );
}
