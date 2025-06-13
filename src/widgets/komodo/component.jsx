import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const containersEndpoint = !(!widget.showSummary && widget.showStacks) ? "containers" : "";
  const { data: containersData, error: containersError } = useWidgetAPI(widget, containersEndpoint);
  const stacksEndpoint = widget.showSummary || widget.showStacks ? "stacks" : "";
  const { data: stacksData, error: stacksError } = useWidgetAPI(widget, stacksEndpoint);
  const serversEndpoint = widget.showSummary ? "servers" : "";
  const { data: serversData, error: serversError } = useWidgetAPI(widget, serversEndpoint);

  if (containersError || stacksError || serversError) {
    return <Container service={service} error={containersError ?? stacksError ?? serversError} />;
  }

  if (!widget.fields || widget.fields.length === 0) {
    widget.fields = widget.showSummary
      ? ["servers", "stacks", "containers"]
      : widget.showStacks
        ? ["total", "running", "down", "unhealthy"]
        : ["total", "running", "stopped", "unhealthy"];
  } else if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (
    (!widget.showStacks && !containersData) ||
    (widget.showSummary && (!stacksData || !serversData)) ||
    (widget.showStacks && !stacksData)
  ) {
    return widget.showSummary ? (
      <Container service={service}>
        <Block label="komodo.servers" />
        <Block label="komodo.stacks" />
        <Block label="komodo.containers" />
      </Container>
    ) : widget.showStacks ? (
      <Container service={service}>
        <Block label="komodo.total" />
        <Block label="komodo.running" />
        <Block label="komodo.down" />
        <Block label="komodo.unhealthy" />
      </Container>
    ) : (
      <Container service={service}>
        <Block label="komodo.total" />
        <Block label="komodo.running" />
        <Block label="komodo.stopped" />
        <Block label="komodo.unhealthy" />
      </Container>
    );
  }

  return widget.showSummary ? (
    <Container service={service}>
      <Block label="komodo.servers" value={`${serversData.healthy} / ${serversData.total}`} />
      <Block label="komodo.stacks" value={`${stacksData.running} / ${stacksData.total}`} />
      <Block label="komodo.containers" value={`${containersData.running} / ${containersData.total}`} />
    </Container>
  ) : widget.showStacks ? (
    <Container service={service}>
      <Block label="komodo.total" value={t("common.number", { value: stacksData.total })} />
      <Block label="komodo.running" value={t("common.number", { value: stacksData.running })} />
      <Block label="komodo.down" value={t("common.number", { value: stacksData.stopped + stacksData.down })} />
      <Block label="komodo.unhealthy" value={t("common.number", { value: stacksData.unhealthy })} />
      <Block label="komodo.unknown" value={t("common.number", { value: stacksData.unknown })} />
    </Container>
  ) : (
    <Container service={service}>
      <Block label="komodo.total" value={t("common.number", { value: containersData.total })} />
      <Block label="komodo.running" value={t("common.number", { value: containersData.running })} />
      <Block label="komodo.stopped" value={t("common.number", { value: containersData.stopped })} />
      <Block label="komodo.unhealthy" value={t("common.number", { value: containersData.unhealthy })} />
      <Block label="komodo.unknown" value={t("common.number", { value: containersData.unknown })} />
    </Container>
  );
}
