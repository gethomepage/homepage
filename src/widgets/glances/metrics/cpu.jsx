import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import Error from "../components/error";
import Container from "../components/container";
import Block from "../components/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

const Chart = dynamic(() => import("../components/chart"), { ssr: false });

const defaultPointsLimit = 15;
const defaultInterval = 1000;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { chart, refreshInterval = defaultInterval, pointsLimit = defaultPointsLimit, version = 3 } = widget;

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ value: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(service.widget, `${version}/cpu`, {
    refreshInterval: Math.max(defaultInterval, refreshInterval),
  });

  const { data: quicklookData, error: quicklookError } = useWidgetAPI(service.widget, `${version}/quicklook`);

  useEffect(() => {
    if (data) {
      setDataPoints((prevDataPoints) => {
        const newDataPoints = [...prevDataPoints, { value: data.total }];
        if (newDataPoints.length > pointsLimit) {
          newDataPoints.shift();
        }
        return newDataPoints;
      });
    }
  }, [data, pointsLimit]);

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

  return (
    <Container chart={chart}>
      {chart && (
        <Chart
          dataPoints={dataPoints}
          label={[t("resources.used")]}
          formatter={(value) =>
            t("common.number", {
              value,
              style: "unit",
              unit: "percent",
              maximumFractionDigits: 0,
            })
          }
        />
      )}

      {!chart && quicklookData && !quicklookError && (
        <Block position="top-3 right-3">
          <div className="text-[0.6rem] opacity-50">{quicklookData.cpu_name && quicklookData.cpu_name}</div>
        </Block>
      )}

      {quicklookData && !quicklookError && (
        <Block position="bottom-3 left-3">
          {quicklookData.cpu_name && chart && <div className="text-xs opacity-50">{quicklookData.cpu_name}</div>}
        </Block>
      )}

      <Block position="bottom-3 right-3">
        <div className="text-xs font-bold opacity-75">
          {t("common.number", {
            value: data.total,
            style: "unit",
            unit: "percent",
            maximumFractionDigits: 0,
          })}{" "}
          {t("resources.used")}
        </div>
      </Block>
    </Container>
  );
}
