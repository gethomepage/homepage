import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data: containersData, error: containersError } = useWidgetAPI(widget, "containers");
  const stacksEndpoint = widget.showSummary ? "stacks" : "";
  const { data: stacksData, error: stacksError } = useWidgetAPI(widget, stacksEndpoint);

  if (containersError || stacksError) {
    return <Container service={service} error={containersError ?? stacksError} />;
  }

  if (!widget.fields || widget.fields.length === 0) {
    widget.fields = widget.showSummary ? ["stacks", "containers"] : ["total", "running", "stopped", "unhealthy"];
  } else if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (!containersData || (widget.showSummary && !stacksData)) {
    return widget.showSummary ? (
      <Container service={service}>
        <Block label="komodo.stacks" />
        <Block label="komodo.containers" />
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
      <Block label="komodo.stacks" value={`${stacksData.running} / ${stacksData.total}`} />
      <Block label="komodo.containers" value={`${containersData.running} / ${containersData.total}`} />
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
