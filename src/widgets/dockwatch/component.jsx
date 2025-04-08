import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const dockwatchDefaultFields = ["running", "stopped", "uptodate", "outdated"];
const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data, error } = useWidgetAPI(widget, "stats");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!widget.fields || widget.fields.length === 0) {
    widget.fields = dockwatchDefaultFields;
  } else if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="dockwatch.running" />
        <Block label="dockwatch.stopped" />
        <Block label="dockwatch.total" />
        <Block label="dockwatch.healthy" />
        <Block label="dockwatch.unhealthy" />
        <Block label="dockwatch.unknown" />
        <Block label="dockwatch.uptodate" />
        <Block label="dockwatch.outdated" />
        <Block label="dockwatch.unchecked" />
        <Block label="dockwatch.disk" />
        <Block label="dockwatch.cpu" />
        <Block label="dockwatch.memory" />
        <Block label="dockwatch.netIO" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="dockwatch.running" value={t("common.number", { value: data.response.status.running })} />
      <Block label="dockwatch.stopped" value={t("common.number", { value: data.response.status.stopped })} />
      <Block label="dockwatch.total" value={t("common.number", { value: data.response.status.total })} />
      <Block label="dockwatch.healthy" value={t("common.number", { value: data.response.health.healthy })} />
      <Block label="dockwatch.unhealthy" value={t("common.number", { value: data.response.health.unhealthy })} />
      <Block label="dockwatch.unknown" value={t("common.number", { value: data.response.health.unknown })} />
      <Block label="dockwatch.uptodate" value={t("common.number", { value: data.response.updates.uptodate })} />
      <Block label="dockwatch.outdated" value={t("common.number", { value: data.response.updates.outdated })} />
      <Block label="dockwatch.unchecked" value={t("common.number", { value: data.response.updates.unchecked })} />
      <Block label="dockwatch.disk" value={t("common.bbytes", { value: data.response.usage.disk })} />
      <Block label="dockwatch.cpu" value={t("common.percent", { value: data.response.usage.cpu })} />
      <Block label="dockwatch.memory" value={t("common.percent", { value: data.response.usage.memory })} />
      <Block label="dockwatch.netIO" value={t("common.bbytes", { value: data.response.usage.netIO })} />
    </Container>
  );
}
