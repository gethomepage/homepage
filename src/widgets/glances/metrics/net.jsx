import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import Error from "../components/error";
import Container from "../components/container";
import Block from "../components/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

const ChartDual = dynamic(() => import("../components/chart_dual"), { ssr: false });

const defaultPointsLimit = 15;
const defaultInterval = (isChart) => (isChart ? 1000 : 5000);

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { chart, metric } = widget;
  const { refreshInterval = defaultInterval(chart), pointsLimit = defaultPointsLimit } = widget;

  const [, interfaceName] = metric.split(":");

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ value: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(widget, "network", {
    refreshInterval: Math.max(defaultInterval(chart), refreshInterval),
  });

  useEffect(() => {
    if (data) {
      const interfaceData = data.find((item) => item[item.key] === interfaceName);

      if (interfaceData) {
        setDataPoints((prevDataPoints) => {
          const newDataPoints = [
            ...prevDataPoints,
            {
              a: (interfaceData.rx * 8) / interfaceData.time_since_update,
              b: (interfaceData.tx * 8) / interfaceData.time_since_update,
            },
          ];
          if (newDataPoints.length > pointsLimit) {
            newDataPoints.shift();
          }
          return newDataPoints;
        });
      }
    }
  }, [data, interfaceName, pointsLimit]);

  if (error) {
    return (
      <Container chart={chart}>
        <Error error={error} />
      </Container>
    );
  }

  if (!data) {
    return (
      <Container chart={chart}>
        <Block position="bottom-3 left-3">-</Block>
      </Container>
    );
  }

  const interfaceData = data.find((item) => item[item.key] === interfaceName);

  if (!interfaceData) {
    return (
      <Container chart={chart}>
        <Block position="bottom-3 left-3">-</Block>
      </Container>
    );
  }

  return (
    <Container chart={chart}>
      {chart && (
        <ChartDual
          dataPoints={dataPoints}
          label={[t("docker.rx"), t("docker.tx")]}
          formatter={(value) =>
            t("common.bitrate", {
              value,
              maximumFractionDigits: 0,
            })
          }
        />
      )}

      <Block position="bottom-3 left-3">
        {interfaceData && interfaceData.interface_name && chart && (
          <div className="text-xs opacity-50">{interfaceData.interface_name}</div>
        )}

        <div className="text-xs opacity-75">
          {t("common.bitrate", {
            value: (interfaceData.rx * 8) / interfaceData.time_since_update,
            maximumFractionDigits: 0,
          })}{" "}
          {t("docker.rx")}
        </div>
      </Block>

      {!chart && (
        <Block position="top-3 right-3">
          {interfaceData && interfaceData.interface_name && (
            <div className="text-xs opacity-50">{interfaceData.interface_name}</div>
          )}
        </Block>
      )}

      <Block position="bottom-3 right-3">
        <div className="text-xs opacity-75">
          {t("common.bitrate", {
            value: (interfaceData.tx * 8) / interfaceData.time_since_update,
            maximumFractionDigits: 0,
          })}{" "}
          {t("docker.tx")}
        </div>
      </Block>
    </Container>
  );
}
