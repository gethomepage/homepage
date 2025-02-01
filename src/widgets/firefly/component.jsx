import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const formatter = new Intl.DateTimeFormat("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit" });

  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const startOfMonthFormatted = formatter.format(startOfMonth);
  const endOfMonth = new Date(startOfMonth);
  endOfMonth.setMonth(endOfMonth.getMonth() + 1);
  endOfMonth.setDate(0);
  endOfMonth.setHours(23, 59, 59, 999);
  const endOfMonthFormatted = formatter.format(endOfMonth);

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

  const netWorth = [];
  Object.keys(summaryData).forEach((key) => {
    if (key.includes("net-worth-in")) {
      netWorth.push(summaryData[key]);
    }
  });

  let budgetValue = null;

  if (budgetData.data && budgetData.data.length > 0 && budgetData.data[0].type === "available_budgets") {
    const budgetAmount = parseFloat(budgetData.data[0].attributes.amount);
    const budgetSpent = -parseFloat(budgetData.data[0].attributes.spent_in_budgets[0]?.sum ?? "0");
    const budgetCurrency = budgetData.data[0].attributes.currency_symbol;

    budgetValue = `${budgetCurrency} ${t("common.number", { value: budgetSpent })} / ${budgetCurrency} ${t(
      "common.number",
      { value: budgetAmount },
    )}`;
  }

  return (
    <Container service={service}>
      <Block label="firefly.networth" value={netWorth[0].value_parsed} />
      <Block label="firefly.budget" value={budgetValue} />
    </Container>
  );
}
