import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function getValue(field, data) {
  let value = data;
  let lastField = field;
  let key = '';

  while (typeof lastField === "object") {
    key = Object.keys(lastField)[0] ?? null;

    if (key === null) {
      break;
    }

    value = value[key];
    lastField = lastField[key];
  }

  if (typeof value === 'undefined') {
    return null;
  }

  return value[lastField] ?? null;
}

function formatValue(t, mapping, value) {
  switch (mapping?.format) {
    case 'number':
      return t("common.number", { value: parseInt(value, 10) });
    case 'float':
      return t("common.number", { value });
    case 'percent':
      return t("common.percent", { value });
    case 'text':
    default:
      return value;
  }
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { mappings = [], refreshInterval = 10000 } = widget;
  const { data: customData, error: customError } = useWidgetAPI(widget, null, {
    refreshInterval: Math.max(1000, refreshInterval),
  });

  if (customError) {
    return <Container service={service} error={customError} />;
  }

  if (!customData) {
    return (
      <Container service={service}>
        { mappings.slice(0,4).map(item => <Block label={item.label} key={item.field} />) }
      </Container>
    );
  }

  return (
    <Container service={service}>
      { mappings.slice(0,4).map(mapping => <Block
        label={mapping.label}
        key={mapping.field}
        value={formatValue(t, mapping, getValue(mapping.field, customData))}
      />) }
    </Container>
  );
}
