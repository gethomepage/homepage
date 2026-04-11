import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "costs");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label={t("awscostexplorer.mtd")} value="..." />
      </Container>
    );
  }

  const amount = parseFloat(data.amount);
  const currency = data.unit ?? "USD";
  const formatted = new Intl.NumberFormat(undefined, { style: "currency", currency }).format(amount);

  return (
    <Container service={service}>
      <Block label={t("awscostexplorer.mtd")} value={formatted} />
    </Container>
  );
}
