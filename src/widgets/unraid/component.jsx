import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const UNRAID_DEFAULT_FIELDS = ["status", "cpu", "memoryPercent", "notifications"];
const MAX_ALLOWED_FIELDS = 4;

const POOLS = ["pool1", "pool2", "pool3", "pool4"];
const POOL_FIELDS = [
  { param: "UsedSpace", label: "poolUsed", valueKey: "fsUsed", valueType: "common.bytes" },
  { param: "FreeSpace", label: "poolFree", valueKey: "fsFree", valueType: "common.bytes" },
  { param: "UsedPercent", label: "poolUsed", valueKey: "fsUsedPercent", valueType: "common.percent" },
];

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!widget.fields?.length) {
    widget.fields = UNRAID_DEFAULT_FIELDS;
  } else if (widget.fields.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="unraid.status" />
        <Block label="unraid.memoryAvailable" />
        <Block label="unraid.memoryUsed" />
        <Block field="unraid.memoryPercent" label="unraid.memoryUsed" />
        <Block label="unraid.cpu" />
        <Block label="unraid.notifications" />
        <Block field="unraid.arrayUsedSpace" label="unraid.arrayUsed" />
        <Block field="unraid.arrayFree" label="unraid.arrayFree" />
        <Block field="unraid.arrayUsedPercent" label="unraid.arrayUsed" />
        {...POOLS.flatMap((pool) =>
          POOL_FIELDS.map(({ param, label }) => (
            <Block
              key={`${pool}-${param}`}
              field={`unraid.${pool}${param}`}
              label={t(`unraid.${label}`, { pool: widget?.[pool] || pool })}
            />
          )),
        )}
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="unraid.status" value={t(`unraid.${data.arrayState}`)} />
      <Block label="unraid.memoryAvailable" value={t("common.bbytes", { value: data.memoryAvailable })} />
      <Block label="unraid.memoryUsed" value={t("common.bbytes", { value: data.memoryUsed })} />
      <Block
        field="unraid.memoryPercent"
        label="unraid.memoryUsed"
        value={t("common.percent", { value: data.memoryUsedPercent })}
      />
      <Block label="unraid.cpu" value={t("common.percent", { value: data.cpuPercent })} />
      <Block label="unraid.notifications" value={t("common.number", { value: data.unreadNotifications })} />
      <Block
        field="unraid.arrayUsedSpace"
        label="unraid.arrayUsed"
        value={t("common.bytes", { value: data.arrayUsed })}
      />
      <Block label="unraid.arrayFree" value={t("common.bytes", { value: data.arrayFree })} />
      <Block
        field="unraid.arrayUsedPercent"
        label="unraid.arrayUsed"
        value={t("common.percent", { value: data.arrayUsedPercent })}
      />
      {...POOLS.flatMap((pool) =>
        POOL_FIELDS.map(({ param, label, valueKey, valueType }) => (
          <Block
            key={`${pool}-${param}`}
            field={`unraid.${pool}${param}`}
            label={t(`unraid.${label}`, { pool: widget?.[pool] || pool })}
            value={t(valueType, { value: data.caches?.[widget?.[pool]]?.[valueKey] || "-" })}
          />
        )),
      )}
    </Container>
  );
}
