import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import Container from "../components/container";
import Block from "../components/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

const ChartDual = dynamic(() => import("../components/chart_dual"), { ssr: false });

const defaultPointsLimit = 15;
const defaultInterval = (isChart) => (isChart ? 1000 : 5000);

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { chart } = widget;
  const { refreshInterval = defaultInterval(chart), pointsLimit = defaultPointsLimit, version = 3 } = widget;

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ value: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(service.widget, `${version}/mem`, {
    refreshInterval: Math.max(defaultInterval(chart), refreshInterval),
  });

  useEffect(() => {
    if (data) {
      setDataPoints((prevDataPoints) => {
        const newDataPoints = [...prevDataPoints, { a: data.used, b: data.free }];
        if (newDataPoints.length > pointsLimit) {
          newDataPoints.shift();
        }
        return newDataPoints;
      });
    }
  }, [data, pointsLimit]);

  if (error) {
    return <Container error={error} widget={widget} />;
  }

  if (!data) {
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
          max={data.total}
          label={[t("resources.used"), t("resources.free")]}
          formatter={(value) =>
            t("common.bytes", {
              value,
              maximumFractionDigits: 0,
              binary: true,
            })
          }
        />
      )}

      {data && !error && (
        <Block position="bottom-3 left-3">
          {data.free && chart && (
            <div className="text-xs opacity-50">
              {t("common.bytes", {
                value: data.free,
                maximumFractionDigits: 1,
                binary: true,
              })}{" "}
              {t("resources.free")}
            </div>
          )}

          {data.total && (
            <div className="text-xs opacity-50">
              {t("common.bytes", {
                value: data.total,
                maximumFractionDigits: 1,
                binary: true,
              })}{" "}
              {t("resources.total")}
            </div>
          )}
        </Block>
      )}

      {!chart && (
        <Block position="top-3 right-3">
          {data.free && (
            <div className="text-xs opacity-50">
              {t("common.bytes", {
                value: data.free,
                maximumFractionDigits: 1,
                binary: true,
              })}{" "}
              {t("resources.free")}
            </div>
          )}
        </Block>
      )}

      <Block position="bottom-3 right-3">
        <div className="text-xs font-bold opacity-75">
          {t("common.bytes", {
            value: data.used,
            maximumFractionDigits: 1,
            binary: true,
          })}{" "}
          {t("resources.used")}
        </div>
      </Block>
    </Container>
  );
}
