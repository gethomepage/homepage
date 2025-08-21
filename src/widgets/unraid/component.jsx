import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const UNRAID_DEFAULT_FIELDS = ["status", "cpu", "memoryPercent", "notifications"];
const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!widget.fields?.length > 0) {
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
        <Block label="unraid.memoryPercent" />
        <Block label="unraid.cpu" />
        <Block label="unraid.notifications" />
        <Block label="unraid.arrayUsedSpace" />
        <Block label="unraid.arrayFreeSpace" />
        <Block label="unraid.arrayUsedPercent" />

        <Block field="unraid.pool1UsedSpace" label={t("unraid.poolUsedSpace", { pool: widget?.pool1 || "pool1" })} />
        <Block field="unraid.pool1FreeSpace" label={t("unraid.poolFreeSpace", { pool: widget?.pool1 || "pool1" })} />
        <Block
          field="unraid.pool1UsedPercent"
          label={t("unraid.poolUsedPercent", { pool: widget?.pool1 || "pool1" })}
        />

        <Block field="unraid.pool2UsedSpace" label={t("unraid.poolUsedSpace", { pool: widget?.pool2 || "pool2" })} />
        <Block field="unraid.pool2FreeSpace" label={t("unraid.poolFreeSpace", { pool: widget?.pool2 || "pool2" })} />
        <Block
          field="unraid.pool2UsedPercent"
          label={t("unraid.poolUsedPercent", { pool: widget?.pool2 || "pool2" })}
        />

        <Block field="unraid.pool3UsedSpace" label={t("unraid.poolUsedSpace", { pool: widget?.pool3 || "pool3" })} />
        <Block field="unraid.pool3FreeSpace" label={t("unraid.poolFreeSpace", { pool: widget?.pool3 || "pool3" })} />
        <Block
          field="unraid.pool3UsedPercent"
          label={t("unraid.poolUsedPercent", { pool: widget?.pool3 || "pool3" })}
        />

        <Block field="unraid.pool4UsedSpace" label={t("unraid.poolUsedSpace", { pool: widget?.pool4 || "pool4" })} />
        <Block field="unraid.pool4FreeSpace" label={t("unraid.poolFreeSpace", { pool: widget?.pool4 || "pool4" })} />
        <Block
          field="unraid.pool4UsedPercent"
          label={t("unraid.poolUsedPercent", { pool: widget?.pool4 || "pool4" })}
        />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="unraid.status" value={t(`unraid.${data.arrayState}`)} />
      <Block label="unraid.memoryAvailable" value={t("common.bbytes", { value: data.memoryAvailable })} />
      <Block label="unraid.memoryUsed" value={t("common.bbytes", { value: data.memoryUsed })} />
      <Block label="unraid.memoryPercent" value={t("common.percent", { value: data.memoryUsedPercent })} />
      <Block label="unraid.cpu" value={t("common.percent", { value: data.cpuPercent })} />
      <Block label="unraid.notifications" value={t("common.number", { value: data.unreadNotifications })} />
      <Block label="unraid.arrayUsedSpace" value={t("common.bytes", { value: data.arrayUsed })} />
      <Block label="unraid.arrayFreeSpace" value={t("common.bytes", { value: data.arrayFree })} />
      <Block label="unraid.arrayUsedPercent" value={t("common.percent", { value: data.arrayUsedPercent })} />

      <Block
        field="unraid.pool1UsedSpace"
        label={t("unraid.poolUsedSpace", { pool: widget?.pool1 || "pool1" })}
        value={t("common.bytes", { value: data.caches?.[widget?.pool1]?.fsUsed || "-" })}
      />
      <Block
        field="unraid.pool1FreeSpace"
        label={t("unraid.poolFreeSpace", { pool: widget?.pool1 || "pool1" })}
        value={t("common.bytes", { value: data.caches?.[widget?.pool1]?.fsFree || "-" })}
      />
      <Block
        field="unraid.pool1UsedPercent"
        label={t("unraid.poolUsedPercent", { pool: widget?.pool1 || "pool1" })}
        value={t("common.percent", { value: data.caches?.[widget?.pool1]?.fsUsedPercent || "-" })}
      />

      <Block
        field="unraid.pool2UsedSpace"
        label={t("unraid.poolUsedSpace", { pool: widget?.pool2 || "pool2" })}
        value={t("common.bytes", { value: data.caches?.[widget?.pool2]?.fsUsed || "-" })}
      />
      <Block
        field="unraid.pool2FreeSpace"
        label={t("unraid.poolFreeSpace", { pool: widget?.pool2 || "pool2" })}
        value={t("common.bytes", { value: data.caches?.[widget?.pool2]?.fsFree || "-" })}
      />
      <Block
        field="unraid.pool2UsedPercent"
        label={t("unraid.poolUsedPercent", { pool: widget?.pool2 || "pool2" })}
        value={t("common.percent", { value: data.caches?.[widget?.pool2]?.fsUsedPercent || "-" })}
      />

      <Block
        field="unraid.pool3UsedSpace"
        label={t("unraid.poolUsedSpace", { pool: widget?.pool3 || "pool3" })}
        value={t("common.bytes", { value: data.caches?.[widget?.pool3]?.fsUsed || "-" })}
      />
      <Block
        field="unraid.pool3FreeSpace"
        label={t("unraid.poolFreeSpace", { pool: widget?.pool3 || "pool3" })}
        value={t("common.bytes", { value: data.caches?.[widget?.pool3]?.fsFree || "-" })}
      />
      <Block
        field="unraid.pool3UsedPercent"
        label={t("unraid.poolUsedPercent", { pool: widget?.pool3 || "pool3" })}
        value={t("common.percent", { value: data.caches?.[widget?.pool3]?.fsUsedPercent || "-" })}
      />

      <Block
        field="unraid.pool4UsedSpace"
        label={t("unraid.poolUsedSpace", { pool: widget?.pool4 || "pool4" })}
        value={t("common.bytes", { value: data.caches?.[widget?.pool4]?.fsUsed || "-" })}
      />
      <Block
        field="unraid.pool4FreeSpace"
        label={t("unraid.poolFreeSpace", { pool: widget?.pool4 || "pool4" })}
        value={t("common.bytes", { value: data.caches?.[widget?.pool4]?.fsFree || "-" })}
      />
      <Block
        field="unraid.pool4UsedPercent"
        label={t("unraid.poolUsedPercent", { pool: widget?.pool4 || "pool4" })}
        value={t("common.percent", { value: data.caches?.[widget?.pool4]?.fsUsedPercent || "-" })}
      />
    </Container>
  );
}
