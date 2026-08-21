import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const DEFAULT_FIELDS = ["activeSubscriptions", "nextRenewingSubscription", "thisMonthlyCost", "nextMonthlyCost"];

const todayDate = new Date();
function toApiMonthYear(offset = 0) {
  // API expects 1-indexed months, wrap around if needed
  const m = todayDate.getMonth() + 1 + offset;
  return {
    month: ((m + 11) % 12) + 1,
    year: todayDate.getFullYear() + Math.floor((m - 1) / 12),
  };
}

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();
  const service = withWidgetFields(configuredService, DEFAULT_FIELDS);
  const { widget } = service;

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
    toApiMonthYear(), // this month
  );
  const subscriptionsNextMonthlyEndpoint = widget.fields.includes("nextMonthlyCost") ? "get_monthly_cost" : "";
  const { data: subscriptionsNextMonthlyCostData, error: subscriptionsNextMonthlyCostError } = useWidgetAPI(
    widget,
    subscriptionsNextMonthlyEndpoint,
    toApiMonthYear(1), // next month
  );
  const subscriptionsPreviousMonthlyEndpoint = widget.fields.includes("previousMonthlyCost") ? "get_monthly_cost" : "";
  const { data: subscriptionsPreviousMonthlyCostData, error: subscriptionsPreviousMonthlyCostError } = useWidgetAPI(
    widget,
    subscriptionsPreviousMonthlyEndpoint,
    toApiMonthYear(-1), // previous month
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
