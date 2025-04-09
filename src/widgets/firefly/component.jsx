import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthFormatted = startOfMonth.toISOString().split("T")[0];

  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);
  const endOfMonthFormatted = endOfMonth.toISOString().split("T")[0];

  const { data: summaryData, error: summaryError } = useWidgetAPI(widget, "summary", {
    start: startOfMonthFormatted,
    end: endOfMonthFormatted,
  });

  const { data: budgetData, error: budgetError } = useWidgetAPI(widget, "budgets", {
    start: startOfMonthFormatted,
    end: endOfMonthFormatted,
  });

  if (summaryError || budgetError) {
    return <Container service={service} error="Failed to load Firefly account summary and budgets" />;
  }

  if (!summaryData || !budgetData) {
    return (
      <Container service={service}>
        <Block label="firefly.networth" />
        <Block label="firefly.budget" />
      </Container>
    );
  }

  const netWorth = Object.keys(summaryData)
    .filter((key) => key.includes("net-worth-in"))
    .map((key) => summaryData[key]);

  let budgetValue = null;

  if (budgetData.data?.length && budgetData.data[0].type === "available_budgets") {
    const budgetAmount = parseFloat(budgetData.data[0].attributes.amount);
    const budgetSpent = -parseFloat(budgetData.data[0].attributes.spent_in_budgets[0]?.sum ?? "0");
    const budgetCurrency = budgetData.data[0].attributes.currency_symbol;

    budgetValue = `${budgetCurrency} ${t("common.number", {
      value: budgetSpent,
      minimumFractionDigits: 2,
    })} / ${budgetCurrency} ${t("common.number", {
      value: budgetAmount,
      minimumFractionDigits: 2,
    })}`;
  }

  return (
    <Container service={service}>
      <Block label="firefly.networth" value={netWorth[0].value_parsed} />
      <Block label="firefly.budget" value={budgetValue} />
    </Container>
  );
}
