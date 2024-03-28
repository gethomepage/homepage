import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import Error from "../components/error";
import Container from "../components/container";
import Block from "../components/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

const ChartDual = dynamic(() => import("../components/chart_dual"), { ssr: false });

const defaultPointsLimit = 15;
const defaultInterval = 1000;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { chart, refreshInterval = defaultInterval, pointsLimit = defaultPointsLimit } = widget;
  const [, gpuName] = widget.metric.split(":");

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ a: 0, b: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(widget, "gpu", {
    refreshInterval: Math.max(defaultInterval, refreshInterval),
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
  }, [data, gpuName, pointsLimit]);

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

  // eslint-disable-next-line eqeqeq
  const gpuData = data.find((item) => item[item.key] == gpuName);

  if (!gpuData) {
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
          label={[t("glances.mem"), t("glances.gpu")]}
          stack={["mem", "proc"]}
          formatter={(value) =>
            t("common.percent", {
              value,
              maximumFractionDigits: 1,
            })
          }
        />
      )}

      {chart && (
        <Block position="bottom-3 left-3">
          {gpuData && gpuData.name && <div className="text-xs opacity-50">{gpuData.name}</div>}

          <div className="text-xs opacity-50">
            {t("common.number", {
              value: gpuData.mem,
              maximumFractionDigits: 1,
            })}
            % {t("resources.mem")}
          </div>
        </Block>
      )}

      {!chart && (
        <Block position="bottom-3 left-3">
          <div className="text-xs opacity-50">
            {t("common.number", {
              value: gpuData.temperature,
              maximumFractionDigits: 1,
            })}
            &deg; C
          </div>
        </Block>
      )}

      <Block position="bottom-3 right-3">
        <div className="text-xs opacity-75">
          {!chart && (
            <div className="inline-block mr-1">
              {t("common.number", {
                value: gpuData.proc,
                maximumFractionDigits: 1,
              })}
              % {t("glances.gpu")}
            </div>
          )}
          {!chart && <>&bull;</>}
          <div className="inline-block ml-1">
            {t("common.number", {
              value: gpuData.proc,
              maximumFractionDigits: 1,
            })}
            % {t("glances.gpu")}
          </div>
        </div>
      </Block>

      <Block position="top-3 right-3">
        {chart && (
          <div className="text-xs opacity-50">
            {t("common.number", {
              value: gpuData.temperature,
              maximumFractionDigits: 1,
            })}
            &deg; C
          </div>
        )}

        {gpuData && gpuData.name && !chart && <div className="text-xs opacity-50">{gpuData.name}</div>}
      </Block>
    </Container>
  );
}
