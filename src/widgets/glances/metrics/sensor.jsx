import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import Error from "../components/error";
import Container from "../components/container";
import Block from "../components/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

const Chart = dynamic(() => import("../components/chart"), { ssr: false });

const pointsLimit = 15;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const [, sensorName] = widget.metric.split(':');

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ value: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(service.widget, 'sensors', {
    refreshInterval: 1000,
  });

  useEffect(() => {
    if (data) {
      const sensorData = data.find((item) => item.label === sensorName);
      setDataPoints((prevDataPoints) => {
        const newDataPoints = [...prevDataPoints, { value: sensorData.value }];
          if (newDataPoints.length > pointsLimit) {
              newDataPoints.shift();
          }
          return newDataPoints;
      });
    }
  }, [data, sensorName]);

  if (error) {
    return <Container><Error error={error} /></Container>;
  }

  if (!data) {
    return <Container><Block position="bottom-3 left-3">-</Block></Container>;
  }

  const sensorData = data.find((item) => item.label === sensorName);

  if (!sensorData) {
    return <Container><Block position="bottom-3 left-3">-</Block></Container>;
  }

  return (
    <Container>
      <Chart
        dataPoints={dataPoints}
        label={[sensorData.unit]}
        max={sensorData.critical}
        formatter={(value) => t("common.number", {
          value,
          })}
      />

      {sensorData && !error && (
        <Block position="bottom-3 left-3">
          {sensorData.warning && (
            <div className="text-xs opacity-50">
              {sensorData.warning}{sensorData.unit} {t("glances.warn")}
            </div>
          )}
          {sensorData.critical && (
            <div className="text-xs opacity-50">
              {sensorData.critical} {sensorData.unit} {t("glances.crit")}
            </div>
          )}
        </Block>
      )}

      <Block position="bottom-3 right-3">
        <div className="text-xs opacity-75">
          {t("common.number", {
            value: sensorData.value,
          })} {sensorData.unit}
        </div>
      </Block>
    </Container>
  );
}
