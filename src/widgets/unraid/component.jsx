import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const UNRAID_DEFAULT_FIELDS = ["status", "cpu", "memoryPercent", "notifications"];

const POOLS = ["pool1", "pool2", "pool3", "pool4"];
const POOL_FIELDS = [
  { param: "UsedSpace", label: "poolUsed", valueKey: "fsUsed", valueType: "common.bytes" },
  { param: "FreeSpace", label: "poolFree", valueKey: "fsFree", valueType: "common.bytes" },
  { param: "UsedPercent", label: "poolUsed", valueKey: "fsUsedPercent", valueType: "common.percent" },
];

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();
  const service = withWidgetFields(configuredService, UNRAID_DEFAULT_FIELDS);
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget);

  if (error) {
    return <Container service={service} error={error} />;
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
      <Block
        label="unraid.memoryAvailable"
        value={t("common.bbytes", { value: data.memoryAvailable })}
        highlightValue={data.memoryAvailable}
      />
      <Block
        label="unraid.memoryUsed"
        value={t("common.bbytes", { value: data.memoryUsed })}
        highlightValue={data.memoryUsed}
      />
      <Block
        field="unraid.memoryPercent"
        label="unraid.memoryUsed"
        value={t("common.percent", { value: data.memoryUsedPercent })}
        highlightValue={data.memoryUsedPercent}
      />
      <Block
        label="unraid.cpu"
        value={t("common.percent", { value: data.cpuPercent })}
        highlightValue={data.cpuPercent}
      />
      <Block label="unraid.notifications" value={t("common.number", { value: data.unreadNotifications })} />
      <Block
        field="unraid.arrayUsedSpace"
        label="unraid.arrayUsed"
        value={t("common.bytes", { value: data.arrayUsed })}
        highlightValue={data.arrayUsed}
      />
      <Block
        label="unraid.arrayFree"
        value={t("common.bytes", { value: data.arrayFree })}
        highlightValue={data.arrayFree}
      />
      <Block
        field="unraid.arrayUsedPercent"
        label="unraid.arrayUsed"
        value={t("common.percent", { value: data.arrayUsedPercent })}
        highlightValue={data.arrayUsedPercent}
      />
      {...POOLS.flatMap((pool) =>
        POOL_FIELDS.map(({ param, label, valueKey, valueType }) => {
          const poolValue = data.caches?.[widget?.[pool]]?.[valueKey] || "-";

          return (
            <Block
              key={`${pool}-${param}`}
              field={`unraid.${pool}${param}`}
              label={t(`unraid.${label}`, { pool: widget?.[pool] || pool })}
              value={t(valueType, { value: poolValue })}
              highlightValue={poolValue}
            />
          );
        }),
      )}
    </Container>
  );
}
