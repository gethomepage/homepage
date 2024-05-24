import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export const homeboxDefaultFields = ["items", "locations", "totalValue"];

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data: homeboxData, error: homeboxError } = useWidgetAPI(widget);

  if (homeboxError) {
    return <Container service={service} error={homeboxError} />;
  }

  // Default fields
  if (!widget.fields?.length > 0) {
    widget.fields = homeboxDefaultFields;
  }
  const MAX_ALLOWED_FIELDS = 4;
  // Limits max number of displayed fields
  if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
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
