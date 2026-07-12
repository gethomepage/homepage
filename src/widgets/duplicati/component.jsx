import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

const DEFAULT_FIELDS = ["jobs", "errors", "lastBackup", "nextRun"];
const ALL_FIELDS = ["jobs", "stored", "lastBackup", "nextRun", "running", "warnings", "errors"];

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  if (!widget.fields?.length) {
    widget.fields = DEFAULT_FIELDS;
  }

  const { data, error } = useWidgetAPI(widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={{ ...service, widget: { ...widget, fields: widget.fields ?? DEFAULT_FIELDS } }}>
        {ALL_FIELDS.map((field) => (
          <Block key={field} field={`duplicati.${field}`} label={`duplicati.${field}`} />
        ))}
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block field="duplicati.jobs" label="duplicati.jobs" value={t("common.number", { value: data.jobs })} />
      <Block field="duplicati.stored" label="duplicati.stored" value={t("common.bytes", { value: data.stored })} />
      <Block
        field="duplicati.lastBackup"
        label="duplicati.lastBackup"
        value={data.lastBackup ? t("common.relativeDate", { value: data.lastBackup }) : "-"}
      />
      <Block
        field="duplicati.nextRun"
        label="duplicati.nextRun"
        value={data.nextRun ? t("common.relativeDate", { value: data.nextRun }) : "-"}
      />
      <Block field="duplicati.running" label="duplicati.running" value={t("common.number", { value: data.running })} />
      <Block
        field="duplicati.warnings"
        label="duplicati.warnings"
        value={t("common.number", { value: data.warnings })}
      />
      <Block field="duplicati.errors" label="duplicati.errors" value={t("common.number", { value: data.errors })} />
    </Container>
  );
}
