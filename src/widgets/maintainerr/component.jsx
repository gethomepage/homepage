import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import * as shvl from "utils/config/shvl";
import useWidgetAPI from "utils/proxy/use-widget-api";

const defaultFields = ["itemsHandled", "episodesHandled", "moviesHandled", "reclaimable"];

const fields = [
  {
    field: "itemsHandled",
    label: "maintainerr.itemsHandled",
    path: "cleanupTotals.itemsHandled",
    format: "number",
  },
  {
    field: "episodesHandled",
    label: "maintainerr.episodesHandled",
    path: "cleanupTotals.episodesHandled",
    format: "number",
  },
  {
    field: "moviesHandled",
    label: "maintainerr.moviesHandled",
    path: "cleanupTotals.moviesHandled",
    format: "number",
  },
  {
    field: "showsHandled",
    label: "maintainerr.showsHandled",
    path: "cleanupTotals.showsHandled",
    format: "number",
  },
  {
    field: "seasonsHandled",
    label: "maintainerr.seasonsHandled",
    path: "cleanupTotals.seasonsHandled",
    format: "number",
  },
  {
    field: "reclaimable",
    label: "maintainerr.reclaimable",
    path: "collectionSummary.activeSizeBytes",
    format: "bytes",
  },
  {
    field: "movieReclaimable",
    label: "maintainerr.movieReclaimable",
    path: "collectionSummary.movieSizeBytes",
    format: "bytes",
  },
  {
    field: "showReclaimable",
    label: "maintainerr.showReclaimable",
    path: "collectionSummary.showSizeBytes",
    format: "bytes",
  },
  {
    field: "totalCapacity",
    label: "maintainerr.totalCapacity",
    path: "totals.totalSpace",
    format: "bytes",
  },
];

function getConfiguredFields(widgetFields) {
  if (!widgetFields) {
    return null;
  }

  if (typeof widgetFields === "string") {
    try {
      return JSON.parse(widgetFields);
    } catch {
      return null;
    }
  }

  return Array.isArray(widgetFields) ? widgetFields : null;
}

function getVisibleFields(widgetFields) {
  const configuredFields = getConfiguredFields(widgetFields);

  if (!configuredFields?.length) {
    return fields.filter((item) => defaultFields.includes(item.field));
  }

  const selectedFields = configuredFields.slice(0, 4).map((field) => String(field).replace(/^maintainerr\./, ""));
  return selectedFields
    .map((field) => fields.find((item) => item.field === field))
    .filter(Boolean);
}

function formatValue(t, format, value) {
  switch (format) {
    case "bytes":
      return t("common.bytes", { value });
    case "number":
    default:
      return t("common.number", { value });
  }
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: maintainerrData, error: maintainerrError } = useWidgetAPI(widget);
  const visibleFields = getVisibleFields(widget.fields);

  if (maintainerrError) {
    return <Container service={service} error={maintainerrError} />;
  }

  return (
    <Container service={service}>
      {visibleFields.map((item) => (
        <Block
          key={item.field}
          field={item.label}
          label={item.label}
          value={
            maintainerrData
              ? formatValue(t, item.format, shvl.get(maintainerrData, item.path, maintainerrData[item.path]))
              : undefined
          }
        />
      ))}
    </Container>
  );
}
