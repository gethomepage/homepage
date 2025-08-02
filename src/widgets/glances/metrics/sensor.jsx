import { useTranslation } from "next-i18next";
import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

import Block from "../components/block";
import Container from "../components/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

const Chart = dynamic(() => import("../components/chart"), { ssr: false });

const defaultPointsLimit = 15;
const defaultInterval = 1000;

export default function Component({ service, type }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { chart, refreshInterval = defaultInterval, pointsLimit = defaultPointsLimit, version = 3 } = widget;
  const [, sensorName] = widget.metric.split(":");

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ value: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(service.widget, `${version}/sensors`, {
    refreshInterval: Math.max(defaultInterval, refreshInterval),
  });

  useEffect(() => {
    if (data && !data.error) {
      const sensorData = data.find((item) => item.label === sensorName);
      if (sensorData) {
        setDataPoints((prevDataPoints) => {
          const newDataPoints = [...prevDataPoints, { value: sensorData.value }];
          if (newDataPoints.length > pointsLimit) {
            newDataPoints.shift();
          }
          return newDataPoints;
        });
      } else {
        data.error = true;
      }
    }
  }, [data, sensorName, pointsLimit]);

  if (error || (data && data.error)) {
    const finalError = error || data.error;
    return <Container error={finalError} widget={widget} />;
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

  // Battery-specific rendering
  if (type === "battery") {
    console.log("Battery sensor data:", sensorData);
    const batteryPercent = sensorData.value || 0;
    const batteryStatus = sensorData.status || "Unknown";
    const batteryLabel = sensorData.label || "Battery";
    
    // Calculate fill height for visual representation (assuming container height ~140px)
    const fillHeight = Math.max(4, (batteryPercent * 1)); // Use percentage directly for height
    
    // Determine battery color based on percentage and status
    const getBatteryColor = (percent, status) => {
      if (status === "Charging") return "text-blue-500";
      if (status === "Full") return "text-green-500";
      if (percent > 50) return "text-green-500";
      if (percent > 20) return "text-yellow-500";
      return "text-red-500";
    };

    const getBatteryFillColor = (percent, status) => {
      // bg-linear-to-b from-theme-500/40 to-theme-500/10 w-full
      //"bg-blue-500/30 border-t-blue-500";
      if (status === "Charging") return "bg-linear-to-b from-blue-500/40 to-blue-500/10 w-full border-t-blue-500";
      if (status === "Full") return "bg-linear-to-b from-green-500/40 to-green-500/10 w-full border-t-green-500";
      if (percent > 50) return "bg-linear-to-b from-green-500/40 to-green-500/10 w-full border-t-green-500";
      if (percent > 20) return "bg-linear-to-b from-yellow-500/40 to-yellow-500/10 w-full border-t-yellow-500";
      return "bg-linear-to-b from-red-500/40 to-red-500/10 w-full border-t-red-500";
    };

    return (
      <Container chart={chart}>
        {/* Always show the fill for battery, regardless of chart setting */}
        <div className="absolute inset-0 flex flex-col justify-end">
          <div
            style={{
              height: `${fillHeight}%`,
              minHeight: "4px"
            }}
            className={`w-full transition-all duration-500 ${getBatteryFillColor(batteryPercent, batteryStatus)} border-t-2 rounded-t-sm`}
          />
        </div>

        <Block position="top-3 right-3">
          <div className="text-xs opacity-50">
            {batteryLabel.replace("BAT ", "")}
          </div>
        </Block>

        <Block position="bottom-3 left-3">
          <div className="text-xs opacity-75">
            {t("common.percent", { value: batteryPercent })}
          </div>
        </Block>

        <Block position="bottom-3 right-3">
          <div className={`text-xs opacity-75 ${getBatteryColor(batteryPercent, batteryStatus)}`}>
            {batteryStatus}
          </div>
        </Block>
      </Container>
    );
  }

  // Regular sensor rendering (temperature, etc.)
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
