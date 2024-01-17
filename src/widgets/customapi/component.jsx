import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function getValue(field, data) {
  let value = data;
  let lastField = field;
  let key = "";

  while (typeof lastField === "object") {
    key = Object.keys(lastField)[0] ?? null;

    if (key === null) {
      break;
    }

    value = value[key];
    lastField = lastField[key];
  }

  if (typeof value === "undefined") {
    return null;
  }

  return value[lastField] ?? null;
}

function formatValue(t, mapping, rawValue) {
  let value = rawValue;

  // Remap the value.
  const remaps = mapping?.remap ?? [];
  for (let i = 0; i < remaps.length; i += 1) {
    const remap = remaps[i];
    if (remap?.any || remap?.value === value) {
      value = remap.to;
      break;
    }
  }

  // Scale the value. Accepts either a number to multiply by or a string
  // like "12/345".
  const scale = mapping?.scale;
  if (typeof scale === "number") {
    value *= scale;
  } else if (typeof scale === "string") {
    const parts = scale.split("/");
    const numerator = parts[0] ? parseFloat(parts[0]) : 1;
    const denominator = parts[1] ? parseFloat(parts[1]) : 1;
    value = (value * numerator) / denominator;
  }

  // Format the value using a known type.
  switch (mapping?.format) {
    case "number":
      value = t("common.number", { value: parseInt(value, 10) });
      break;
    case "float":
      value = t("common.number", { value });
      break;
    case "percent":
      value = t("common.percent", { value });
      break;
    case "bytes":
      value = t("common.bytes", { value });
      break;
    case "bitrate":
      value = t("common.bitrate", { value });
      break;
    case "date":
      value = t("common.date", {
        value,
        lng: mapping?.locale,
        dateStyle: mapping?.dateStyle ?? "long",
        timeStyle: mapping?.timeStyle,
      });
      break;
    case "relativeDate":
      value = t("common.relativeDate", {
        value,
        lng: mapping?.locale,
        style: mapping?.style,
        numeric: mapping?.numeric,
      });
      break;
    case "text":
    default:
    // nothing
  }

  // Apply fixed suffix.
  const suffix = mapping?.suffix;
  if (suffix) {
    value = `${value} ${suffix}`;
  }

  return value;
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
        {mappings.slice(0, 4).map((item) => (
          <Block label={item.label} key={item.label} />
        ))}
      </Container>
    );
  }

  return (
    <Container service={service}>
      {mappings.slice(0, 4).map((mapping) => (
        <Block
          label={mapping.label}
          key={mapping.label}
          value={formatValue(t, mapping, getValue(mapping.field, customData))}
        />
      ))}
    </Container>
  );
}
