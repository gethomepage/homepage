import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { systemId } = widget;

  const { data: systems, error: systemsError } = useWidgetAPI(widget, "systems");

  const MAX_ALLOWED_FIELDS = 4;
  if (!widget.fields?.length > 0) {
    widget.fields = systemId ? ["name", "status", "cpu", "memory"] : ["systems", "up"];
  }
  if (widget.fields?.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (systemsError) {
    return <Container service={service} error={systemsError} />;
  }

  if (!systems) {
    return (
      <Container service={service}>
        <Block label="beszel.systems" />
        <Block label="beszel.up" />
      </Container>
    );
  }

  if (systemId) {
    const system = systems.items.find((item) => item.id === systemId);

    return (
      <Container service={service}>
        <Block label="beszel.name" value={system.name} />
        <Block label="beszel.status" value={t(`beszel.${system.status}`)} />
        <Block label="beszel.updated" value={t("common.relativeDate", { value: system.updated })} />
        <Block label="beszel.cpu" value={t("common.percent", { value: system.info.cpu, maximumFractionDigits: 2 })} />
        <Block label="beszel.memory" value={t("common.percent", { value: system.info.mp, maximumFractionDigits: 2 })} />
        <Block label="beszel.disk" value={t("common.percent", { value: system.info.dp, maximumFractionDigits: 2 })} />
        <Block label="beszel.network" value={t("common.percent", { value: system.info.b, maximumFractionDigits: 2 })} />
      </Container>
    );
  }

  const upTotal = systems.items.filter((item) => item.status === "up").length;

  return (
    <Container service={service}>
      <Block label="beszel.systems" value={systems.totalItems} />
      <Block label="beszel.up" value={`${upTotal} / ${systems.totalItems}`} />
    </Container>
  );
}
