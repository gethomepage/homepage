import { useTranslation } from "next-i18next/pages";
import dynamic from "next/dynamic";
import { useCallback } from "react";

import Block from "../components/block";
import Container from "../components/container";

import useDataPoints from "./use-data-points";

import { parseVersionForUrl } from "utils/proxy/api-helpers";
import useWidgetAPI from "utils/proxy/use-widget-api";

const Chart = dynamic(() => import("../components/chart"), { ssr: false });

const defaultPointsLimit = 15;
const defaultInterval = 1000;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { chart, refreshInterval = defaultInterval, pointsLimit = defaultPointsLimit, version = 3 } = widget;
  const apiVersion = parseVersionForUrl(version, 3);
  const [, sensorName] = widget.metric.split(":");

  const [dataPoints, addDataPoint] = useDataPoints(pointsLimit, { value: 0 });

  const handleData = useCallback(
    (newData) => {
      if (!newData?.error) {
        const sensorData = newData.find((item) => item.label === sensorName);
        if (sensorData) addDataPoint({ value: sensorData.value });
      }
    },
    [addDataPoint, sensorName],
  );

  const { data, error } = useWidgetAPI(
    service.widget,
    `${apiVersion}/sensors`,
    {
      refreshInterval: Math.max(defaultInterval, refreshInterval),
    },
    { onSuccess: handleData },
  );

  if (error || data?.error) {
    return <Container error={error || data.error} widget={widget} />;
  }

  if (!data) {
    return (
      <Container chart={chart}>
        <Block position="bottom-3 left-3">-</Block>
      </Container>
    );
  }

  const sensorData = data.find((item) => item.label === sensorName);

  if (!sensorData) {
    return (
      <Container chart={chart}>
        <Block position="bottom-3 left-3">-</Block>
      </Container>
    );
  }

  return (
    <Container chart={chart}>
      {chart && (
        <Chart
          dataPoints={dataPoints}
          label={[sensorData.unit]}
          max={sensorData.critical}
          formatter={(value) =>
            t("common.number", {
              value,
            })
          }
        />
      )}

      {sensorData && !error && (
        <Block position="bottom-3 left-3">
          {sensorData.warning && chart && (
            <div className="text-xs opacity-50">
              {t("glances.warn")} {sensorData.warning} {sensorData.unit}
            </div>
          )}
          {sensorData.critical && (
            <div className="text-xs opacity-50">
              {t("glances.crit")} {sensorData.critical} {sensorData.unit}
            </div>
          )}
        </Block>
      )}

      <Block position="bottom-3 right-3">
        <div className="text-xs opacity-50">
          {sensorData.warning && !chart && (
            <>
              {t("glances.warn")} {sensorData.warning} {sensorData.unit}
            </>
          )}
        </div>
        <div className="text-xs opacity-75">
          {t("glances.temp")}{" "}
          {t("common.number", {
            value: sensorData.value,
          })}{" "}
          {sensorData.unit}
        </div>
      </Block>
    </Container>
  );
}
