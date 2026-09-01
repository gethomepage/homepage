import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

export const homeboxDefaultFields = ["items", "locations", "totalValue"];

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();
  const service = withWidgetFields(configuredService, homeboxDefaultFields);
  const { widget } = service;
  const { data: homeboxData, error: homeboxError } = useWidgetAPI(widget);

  if (homeboxError) {
    return <Container service={service} error={homeboxError} />;
  }

  if (!homeboxData) {
    return (
      <Container service={service}>
        <Block label="homebox.items" />
        <Block label="homebox.totalWithWarranty" />
        <Block label="homebox.locations" />
        <Block label="homebox.labels" />
        <Block label="homebox.users" />
        <Block label="homebox.totalValue" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="homebox.items" value={t("common.number", { value: homeboxData.items })} />
      <Block label="homebox.totalWithWarranty" value={t("common.number", { value: homeboxData.totalWithWarranty })} />
      <Block label="homebox.locations" value={t("common.number", { value: homeboxData.locations })} />
      <Block label="homebox.labels" value={t("common.number", { value: homeboxData.labels })} />
      <Block label="homebox.users" value={t("common.number", { value: homeboxData.users })} />
      <Block
        label="homebox.totalValue"
        value={t("common.number", {
          value: homeboxData.totalValue,
          style: "currency",
          currency: `${homeboxData.currencyCode}`,
        })}
      />
    </Container>
  );
}
