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
const cpuSensorLabels = ["cpu_thermal", "Core", "Tctl"];

function convertToFahrenheit(t) {
  return (t * 9) / 5 + 32;
}

function TEMP({ sensorData, tempUnits = "metric" }) {
  const { t } = useTranslation();
  const unit = tempUnits === "imperial" ? "fahrenheit" : "celsius";
  let mainTemp = 0;
  let maxTemp = 80;
  const cpuSensors = sensorData?.filter(
    (s) => cpuSensorLabels.some((label) => s.label.startsWith(label)) && s.type === "temperature_core",
  );

  if (cpuSensors) {
    try {
      mainTemp = cpuSensors.reduce((acc, s) => acc + s.value, 0) / cpuSensors.length;
      maxTemp = Math.max(
        cpuSensors.reduce((acc, s) => acc + (s.warning > 0 ? s.warning : 0), 0) / cpuSensors.length,
        maxTemp,
      );
      if (unit === "fahrenheit") {
        mainTemp = convertToFahrenheit(mainTemp);
        maxTemp = convertToFahrenheit(maxTemp);
      }
    } catch (e) {
      // cpu sensor retrieval failed
    }
  }

  return (
    mainTemp > 0 && (
      <div className="text-xs flex">
        <div className="opacity-75 mr-1">
          {t("common.number", {
            value: mainTemp,
            maximumFractionDigits: 1,
            style: "unit",
            unit,
          })}
        </div>
        <div className="opacity-50">
          {"("}{t("glances.warn")}{" @ "}
          {t("common.number", {
            value: maxTemp,
            maximumFractionDigits: 1,
            style: "unit",
            unit,
          })}{")"}
        </div>
      </div>
    )
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { chart, refreshInterval = defaultInterval, pointsLimit = defaultPointsLimit } = widget;

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ value: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(service.widget, "cpu", {
    refreshInterval: Math.max(defaultInterval, refreshInterval),
  });

  const { data: sensorData, error: sensorError } = useWidgetAPI(service.widget, "sensors", {
    refreshInterval: Math.max(defaultInterval, refreshInterval),
  });

  const { data: quicklookData, error: quicklookError } = useWidgetAPI(service.widget, "quicklook");

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
          <div className="text-[0.6rem] opacity-50">
            {quicklookData.cpu_name && quicklookData.cpu_name}
          </div>
        </Block>
      )}

      {quicklookData && !quicklookError && (
        <Block position="bottom-3 left-3">
          <TEMP sensorData={sensorData} tempUnits={widget.tempUnits} />

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
