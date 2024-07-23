import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";
import Pool from "widgets/truenas/pool";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: alertData, error: alertError } = useWidgetAPI(widget, "alerts");
  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");
  const { data: poolsData, error: poolsError } = useWidgetAPI(widget, "pools");

  if (alertError || statusError || poolsError) {
    const finalError = alertError ?? statusError ?? poolsError;
    return <Container service={service} error={finalError} />;
  }

  if (!alertData || !statusData) {
    return (
      <Container service={service}>
        <Block label="truenas.load" />
        <Block label="truenas.uptime" />
        <Block label="truenas.alerts" />
      </Container>
    );
  }

  const enablePools = widget?.enablePools && Array.isArray(poolsData) && poolsData.length > 0;

  return (
    <>
      <Container service={service}>
        <Block label="truenas.load" value={t("common.number", { value: statusData.loadavg[0] })} />
        <Block label="truenas.uptime" value={t("common.uptime", { value: statusData.uptime_seconds })} />
        <Block label="truenas.alerts" value={t("common.number", { value: alertData.pending })} />
      </Container>
      {enablePools &&
        poolsData
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((pool) => (
            <Pool
              key={pool.id}
              name={pool.name}
              healthy={pool.healthy}
              allocated={pool.allocated}
              free={pool.free}
              data={pool.data}
              nasType={widget?.nasType ?? "scale"}
            />
          ))}
    </>
  );
}
