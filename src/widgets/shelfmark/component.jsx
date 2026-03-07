import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export const shelfmarkDefaultFields = [
  "requested",
  "downloading",
  "complete",
  "error",
];
const MAX_ALLOWED_FIELDS = 4;
const shelfmarkFieldPriority = [
  "requested",
  "available",
  "downloading",
  "complete",
  "error",
  "cancelled",
  "done",
  "locating",
  "queued",
  "resolving",
];

function getAutoFields(statusCounts) {
  const availableFields = Object.keys(statusCounts ?? {});
  const prioritized = shelfmarkFieldPriority.filter((field) => availableFields.includes(field));
  const remainder = availableFields.filter((field) => !prioritized.includes(field));
  const merged = [...prioritized, ...remainder];

  if (merged.length === 0) {
    return shelfmarkDefaultFields;
  }

  return merged.slice(0, MAX_ALLOWED_FIELDS);
}

function normalizeFields(widget, statusCounts) {
  if (!widget.fields || widget.fields.length === 0) {
    widget.fields = getAutoFields(statusCounts);
  } else {
    widget.fields = widget.fields
      .filter((field) => shelfmarkFieldPriority.includes(field))
      .slice(0, MAX_ALLOWED_FIELDS);
    if (widget.fields.length === 0) {
      widget.fields = shelfmarkDefaultFields;
    }
  }

  return widget.fields;
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: shelfmarkData, error: shelfmarkError } = useWidgetAPI(widget);

  if (shelfmarkError) {
    return <Container service={service} error={shelfmarkError} />;
  }

  const statusCounts = shelfmarkData?.statuses ?? {};
  const fields = normalizeFields(widget, statusCounts);

  if (!shelfmarkData) {
    return (
      <Container service={service}>
        {fields.map((field) => (
          <Block key={field} field={`shelfmark.${field}`} label={`shelfmark.${field}`} />
        ))}
      </Container>
    );
  }

  return (
    <Container service={service}>
      {fields.map((field) => (
        <Block
          key={field}
          field={`shelfmark.${field}`}
          label={`shelfmark.${field}`}
          value={t("common.number", { value: statusCounts[field] ?? 0 })}
        />
      ))}
    </Container>
  );
}
