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

  const getPercentage = (count, total) => {
    return ((count / total) * 100).toPrecision(3);
  };

  const noErrorPercent = getPercentage(statsData.totalNoError, statsData.totalQueries);
  const failurePercent = getPercentage(statsData.totalServerFailure, statsData.totalQueries);
  const nxDomainPercent = getPercentage(statsData.totalNxDomain, statsData.totalQueries);
  const refusedPercent = getPercentage(statsData.totalRefused, statsData.totalQueries);
  const authoritativePercent = getPercentage(statsData.totalAuthoritative, statsData.totalQueries);
  const recursivePercent = getPercentage(statsData.totalRecursive, statsData.totalQueries);
  const cachedPercent = getPercentage(statsData.totalCached, statsData.totalQueries);
  const blockedPercent = getPercentage(statsData.totalBlocked, statsData.totalQueries);
  const droppedPercent = getPercentage(statsData.totalDropped, statsData.totalQueries);

  return (
    <Container service={service}>
      <Block label="technitium.totalQueries" value={`${t("common.number", { value: statsData.totalQueries })}`} />
      <Block
        label="technitium.totalNoError"
        value={`${t("common.number", { value: statsData.totalNoError })} (${t("common.percent", {
          value: noErrorPercent,
        })})`}
      />
      <Block
        label="technitium.totalServerFailure"
        value={`${t("common.number", { value: statsData.totalServerFailure })} (${t("common.percent", {
          value: failurePercent,
        })})`}
      />
      <Block
        label="technitium.totalNxDomain"
        value={`${t("common.number", { value: statsData.totalNxDomain })} (${t("common.percent", {
          value: nxDomainPercent,
        })})`}
      />
      <Block
        label="technitium.totalRefused"
        value={`${t("common.number", { value: statsData.totalRefused })} (${t("common.percent", {
          value: refusedPercent,
        })})`}
      />
      <Block
        label="technitium.totalAuthoritative"
        value={`${t("common.number", { value: statsData.totalAuthoritative })} (${t("common.percent", {
          value: authoritativePercent,
        })})`}
      />
      <Block
        label="technitium.totalRecursive"
        value={`${t("common.number", { value: statsData.totalRecursive })} (${t("common.percent", {
          value: recursivePercent,
        })})`}
      />
      <Block
        label="technitium.totalCached"
        value={`${t("common.number", { value: statsData.totalCached })} (${t("common.percent", {
          value: cachedPercent,
        })})`}
      />
      <Block
        label="technitium.totalBlocked"
        value={`${t("common.number", { value: statsData.totalBlocked })} (${t("common.percent", {
          value: blockedPercent,
        })})`}
      />
      <Block
        label="technitium.totalDropped"
        value={`${t("common.number", { value: statsData.totalDropped })} (${t("common.percent", {
          value: droppedPercent,
        })})`}
      />
      <Block label="technitium.totalClients" value={`${t("common.number", { value: statsData.totalClients })}`} />
    </Container>
  );
}
