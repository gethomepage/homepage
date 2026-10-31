import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const SUMMARY_FIELDS = ["systems", "up"];
const SYSTEM_FIELDS = ["name", "status", "cpu", "memory"];

function optional(value, format) {
  return value === undefined || value === null ? "-" : format(value);
}

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();

  const defaultFields = configuredService.widget.systemId ? SYSTEM_FIELDS : SUMMARY_FIELDS;
  const service = withWidgetFields(configuredService, defaultFields);
  const { widget } = service;
  const { systemId } = widget;

  const { data: systems, error: systemsError } = useWidgetAPI(widget, "systems");

  let system = null;
  let finalError = systemsError;

  if (systems && !systems.items) {
    finalError = { message: "No items returned from beszel API" };
  } else if (systems && systems.items && systemId) {
    system = systems.items.find((item) => item.id === systemId || item.name === systemId);
    if (!system) {
      finalError = { message: `System with id ${systemId} not found` };
    }
  }

  if (finalError) {
    return <Container service={service} error={finalError} />;
  }

  if (!systems) {
    return (
      <Container service={service}>
        <Block label="beszel.systems" />
        <Block label="beszel.up" />
      </Container>
    );
  }

  if (system) {
    return (
      <Container service={service}>
        <Block label="beszel.name" value={system.name} />
        <Block label="beszel.status" value={t(`beszel.${system.status}`)} />
        <Block label="beszel.updated" value={t("common.relativeDate", { value: system.updated })} />
        <Block
          label="beszel.cpu"
          value={t("common.percent", { value: system.info.cpu, maximumFractionDigits: 2 })}
          highlightValue={system.info.cpu}
        />
        <Block
          label="beszel.memory"
          value={t("common.percent", { value: system.info.mp, maximumFractionDigits: 2 })}
          highlightValue={system.info.mp}
        />
        <Block
          label="beszel.disk"
          value={t("common.percent", { value: system.info.dp, maximumFractionDigits: 2 })}
          highlightValue={system.info.dp}
        />
        <Block
          label="beszel.network"
          value={t("common.byterate", { value: system.info.bb, maximumFractionDigits: 2 })}
          highlightValue={system.info.bb}
        />
        <Block
          label="beszel.temp"
          value={optional(system.info.dt, (value) =>
            t("common.number", { value, maximumFractionDigits: 1, style: "unit", unit: "celsius" }),
          )}
          highlightValue={system.info.dt}
        />
        <Block
          label="beszel.load"
          value={optional(system.info.la?.[0], (value) => t("common.number", { value, maximumFractionDigits: 2 }))}
          highlightValue={system.info.la?.[0]}
        />
        <Block
          label="beszel.gpu"
          value={optional(system.info.g, (value) => t("common.percent", { value, maximumFractionDigits: 2 }))}
          highlightValue={system.info.g}
        />
        <Block label="beszel.uptime" value={optional(system.info.u, (value) => t("common.duration", { value }))} />
        <Block
          label="beszel.services"
          value={optional(system.info.sv, ([total, failed]) => `${total - failed} / ${total}`)}
          highlightValue={system.info.sv?.[1]}
        />
        <Block
          label="beszel.updates"
          value={optional(system.info.pu?.[0], (value) => t("common.number", { value }))}
          highlightValue={system.info.pu?.[0]}
        />
        <Block
          label="beszel.battery"
          value={optional(system.info.bat?.[0], (value) => t("common.percent", { value }))}
          highlightValue={system.info.bat?.[0]}
        />
        <Block label="beszel.agent" value={system.info.v ?? "-"} />
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
