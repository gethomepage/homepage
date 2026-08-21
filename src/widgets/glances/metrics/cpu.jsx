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

  const [dataPoints, addDataPoint] = useDataPoints(pointsLimit, { value: 0 });

  const handleData = useCallback(
    (newData) => {
      if (newData) addDataPoint({ value: newData.total });
    },
    [addDataPoint],
  );

  const { data, error } = useWidgetAPI(
    service.widget,
    `${apiVersion}/cpu`,
    {
      refreshInterval: Math.max(defaultInterval, refreshInterval),
    },
    { onSuccess: handleData },
  );

  const { data: quicklookData, error: quicklookError } = useWidgetAPI(service.widget, `${apiVersion}/quicklook`);

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
