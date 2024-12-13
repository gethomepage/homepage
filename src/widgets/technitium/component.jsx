import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

const MAX_ALLOWED_FIELDS = 4;

export const technitiumDefaultFields = ["totalQueries", "totalAuthoritative", "totalCached", "totalServerFailure"];

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const params = {
    type: widget.range ?? "LastHour",
  };

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "stats", params);

  // Default fields
  if (!widget.fields?.length > 0) {
    widget.fields = technitiumDefaultFields;
  }

  // Limits max number of displayed fields
  if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="technitium.totalQueries" />
        <Block label="technitium.totalNoError" />
        <Block label="technitium.totalServerFailure" />
        <Block label="technitium.totalNxDomain" />
        <Block label="technitium.totalRefused" />
        <Block label="technitium.totalAuthoritative" />
        <Block label="technitium.totalRecursive" />
        <Block label="technitium.totalCached" />
        <Block label="technitium.totalBlocked" />
        <Block label="technitium.totalDropped" />
        <Block label="technitium.totalClients" />
      </Container>
    );
  }

  function toPercent(value, total) {
    return t("common.percent", {
      value: !Number.isNaN(value / total) ? 100 * (value / total) : 0,
      maximumFractionDigits: 2,
    });
  }

  return (
    <Container service={service}>
      <Block label="technitium.totalQueries" value={`${t("common.number", { value: statsData.totalQueries })}`} />
      <Block
        label="technitium.totalNoError"
        value={`${t("common.number", { value: statsData.totalNoError })} (${toPercent(
          statsData.totalNoError,
          statsData.totalQueries,
        )})`}
      />
      <Block
        label="technitium.totalServerFailure"
        value={`${t("common.number", { value: statsData.totalServerFailure })} (${toPercent(
          statsData.totalServerFailure,
          statsData.totalQueries,
        )})`}
      />
      <Block
        label="technitium.totalNxDomain"
        value={`${t("common.number", { value: statsData.totalNxDomain })} (${toPercent(
          statsData.totalNxDomain,
          statsData.totalQueries,
        )})`}
      />
      <Block
        label="technitium.totalRefused"
        value={`${t("common.number", { value: statsData.totalRefused })} (${toPercent(
          statsData.totalRefused,
          statsData.totalQueries,
        )})`}
      />
      <Block
        label="technitium.totalAuthoritative"
        value={`${t("common.number", { value: statsData.totalAuthoritative })} (${toPercent(
          statsData.totalAuthoritative,
          statsData.totalQueries,
        )})`}
      />
      <Block
        label="technitium.totalRecursive"
        value={`${t("common.number", { value: statsData.totalRecursive })} (${toPercent(
          statsData.totalRecursive,
          statsData.totalQueries,
        )})`}
      />
      <Block
        label="technitium.totalCached"
        value={`${t("common.number", { value: statsData.totalCached })} (${toPercent(
          statsData.totalCached,
          statsData.totalQueries,
        )})`}
      />
      <Block
        label="technitium.totalBlocked"
        value={`${t("common.number", { value: statsData.totalBlocked })} (${toPercent(
          statsData.totalBlocked,
          statsData.totalQueries,
        )})`}
      />
      <Block
        label="technitium.totalDropped"
        value={`${t("common.number", { value: statsData.totalDropped })} (${toPercent(
          statsData.totalDropped,
          statsData.totalQueries,
        )})`}
      />
      <Block label="technitium.totalClients" value={`${t("common.number", { value: statsData.totalClients })}`} />
    </Container>
  );
}
