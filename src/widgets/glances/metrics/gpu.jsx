import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import Error from "../components/error";
import Container from "../components/container";
import Block from "../components/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

const ChartDual = dynamic(() => import("../components/chart_dual"), { ssr: false });

const pointsLimit = 15;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const [, gpuName] = widget.metric.split(':');

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ a: 0, b: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(widget, 'gpu', {
    refreshInterval: 1000,
  });

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line eqeqeq
      const gpuData = data.find((item) => item[item.key] == gpuName);

      if (gpuData) {
        setDataPoints((prevDataPoints) => {
          const newDataPoints = [...prevDataPoints, { a: gpuData.mem, b: gpuData.proc }];
            if (newDataPoints.length > pointsLimit) {
                newDataPoints.shift();
            }
            return newDataPoints;
        });
      }
    }
  }, [data, gpuName]);

  if (error) {
    return <Container><Error error={error} /></Container>;
  }

  if (!data) {
    return <Container><Block position="bottom-3 left-3">-</Block></Container>;
  }

  // eslint-disable-next-line eqeqeq
  const gpuData = data.find((item) => item[item.key] == gpuName);

  if (!gpuData) {
    return <Container><Block position="bottom-3 left-3">-</Block></Container>;
  }

  return (
    <Container>
      <ChartDual
        dataPoints={dataPoints}
        label={[t("glances.mem"), t("glances.gpu")]}
        stack={['mem', 'proc']}
        formatter={(value) => t("common.percent", {
          value,
          maximumFractionDigits: 1,
        })}
      />

      <Block position="bottom-3 left-3">
        {gpuData && gpuData.name && (
            <div className="text-xs opacity-50">
              {gpuData.name}
            </div>
        )}

        <div className="text-xs opacity-75">
          {t("common.number", {
            value: gpuData.mem,
            maximumFractionDigits: 1,
          })}% {t("glances.mem")} {t("resources.used")}
        </div>
      </Block>

      <Block position="bottom-3 right-3">
        <div className="text-xs opacity-75">
          {t("common.number", {
            value: gpuData.proc,
            maximumFractionDigits: 1,
          })}% {t("glances.gpu")}
        </div>
      </Block>

      <Block position="top-3 right-3">
        <div className="text-xs opacity-75">
          {t("common.number", {
            value: gpuData.temperature,
            maximumFractionDigits: 1,
          })}&deg;
        </div>
      </Block>
    </Container>
  );
}
