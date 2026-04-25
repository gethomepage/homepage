import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const DEFAULT_FIELDS = ["bots", "version", "memory", "uptime"];
const MAX_ALLOWED_FIELDS = 4;

function parseFields(fields) {
  if (Array.isArray(fields)) {
    return fields;
  }

  if (typeof fields === "string") {
    try {
      const parsedFields = JSON.parse(fields);
      return Array.isArray(parsedFields) ? parsedFields : [];
    } catch {
      return [];
    }
  }

  return [];
}

function getUptimeSeconds(processStartTime) {
  if (!processStartTime) {
    return null;
  }

  const startedAt = Date.parse(processStartTime);
  if (Number.isNaN(startedAt)) {
    return null;
  }

  return Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const configuredFields = parseFields(widget.fields);
  widget.fields = configuredFields.length ? configuredFields.slice(0, MAX_ALLOWED_FIELDS) : DEFAULT_FIELDS;

  const needsBots = widget.fields.includes("bots");
  const needsStats = widget.fields.some((field) => ["version", "memory", "uptime"].includes(field));

  const { data: botsData, error: botsError } = useWidgetAPI(widget, needsBots ? "bots" : "", {
    refreshInterval: 30000,
  });
  const { data: statsData, error: statsError } = useWidgetAPI(widget, needsStats ? "stats" : "", {
    refreshInterval: 60000,
  });

  const error = botsError ?? statsError;
  if (error) {
    return <Container service={service} error={error} />;
  }

  if ((needsBots && !botsData) || (needsStats && !statsData)) {
    return (
      <Container service={service}>
        <Block field="archisteamfarm.bots" label="archisteamfarm.bots" />
        <Block field="archisteamfarm.version" label="archisteamfarm.version" />
        <Block field="archisteamfarm.memory" label="archisteamfarm.memory" />
        <Block field="archisteamfarm.uptime" label="archisteamfarm.uptime" />
      </Container>
    );
  }

  const memoryBytes = Number.isFinite(statsData?.memoryKiB) ? statsData.memoryKiB * 1024 : null;
  const uptimeSeconds = getUptimeSeconds(statsData?.processStartTime);

  return (
    <Container service={service}>
      <Block
        field="archisteamfarm.bots"
        label="archisteamfarm.bots"
        value={t("common.number", { value: botsData?.count ?? 0 })}
      />
      <Block
        field="archisteamfarm.version"
        label="archisteamfarm.version"
        value={statsData?.version ? `v${statsData.version}` : t("archisteamfarm.unknown")}
      />
      <Block
        field="archisteamfarm.memory"
        label="archisteamfarm.memory"
        value={memoryBytes === null ? t("archisteamfarm.unknown") : t("common.bbytes", { value: memoryBytes })}
      />
      <Block
        field="archisteamfarm.uptime"
        label="archisteamfarm.uptime"
        value={uptimeSeconds === null ? t("archisteamfarm.unknown") : t("common.duration", { value: uptimeSeconds })}
      />
    </Container>
  );
}
