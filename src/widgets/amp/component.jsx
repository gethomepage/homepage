import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const defaultFields = ["users", "state", "cpu", "memoryUsedPercent"];

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "getInstance");

  if (error) {
    return <Container service={service} error={error} />;
  }

  // Default fields
  if (!widget.fields?.length > 0) {
    widget.fields = defaultFields;
  }
  const MAX_ALLOWED_FIELDS = 4;
  // Limits max number of displayed fields
  if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="amp.state" />
        <Block label="amp.users" />
        <Block label="amp.cpu" />
        <Block label="amp.memoryUsed" />
        <Block label="amp.memoryUsedPercent" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="amp.state" value={data.state} />
      <Block label="amp.users" value={data.users} />
      <Block
        label="amp.cpu"
        value={t("common.percent", { value: data.cpu, maximumFractionDigits: 2, minimumFractionDigits: 2 })}
      />
      <Block
        label="amp.memoryUsed"
        value={t("common.bbytes", {
          value: data.memoryUsed * 1024 * 1024,
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })}
      />
      <Block
        label="amp.memoryUsedPercent"
        value={t("common.percent", {
          value: data.memoryUsedPercent,
          maximumFractionDigits: 2,
          minimumFractionDigits: 2,
        })}
      />
    </Container>
  );
}
