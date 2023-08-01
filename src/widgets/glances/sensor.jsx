import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const Chart = dynamic(() => import("./chart"), { ssr: false });

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
    return <div>
    <div className="h-[68px] overflow-clip">
      <div className="absolute bottom-2 left-2 z-20 text-red-400 text-xs opacity-80">
      {t("widget.api_error")}
      </div>
    </div>
  </div>;
  }

  if (!data) {
    return <div>
    <div className="h-[68px] overflow-clip">
      <div className="absolute bottom-2 left-2 z-20 text-xs opacity-80">
        -
      </div>
    </div>
  </div>;
  }

  const sensorData = data.find((item) => item.label === sensorName);

  if (!sensorData) {
    return <div>
      <div className="h-[68px] overflow-clip" />
    </div>;
  }

  return (
    <>
      <div className="absolute -top-1 -left-1 h-[120px] w-[calc(100%+0.5em)] z-0">
      <Chart
          dataPoints={dataPoints}
          label={[sensorData.unit]}
          max={sensorData.critical}
          formatter={(value) => t("common.number", {
            value,
            })}
        />
      </div>
      <div className="absolute bottom-3 left-3 opacity-50 z-10 pointer-events-none">
        {sensorData && !error && (
          <>
            {sensorData.warning && (
              <div className="text-xs opacity-80">
                {sensorData.warning}{sensorData.unit} {t("glances.warn")}
              </div>
            )}
            {sensorData.critical && (
              <div className="text-xs opacity-80">
                {sensorData.critical} {sensorData.unit} {t("glances.crit")}
              </div>
            )}
          </>
        )}
      </div>
      <div className="absolute bottom-3 right-3 z-10 text-xs opacity-80 pointer-events-none">
        {t("common.number", {
          value: sensorData.value,
        })} {sensorData.unit}
      </div>
      <div className="h-[68px] overflow-clip" />
    </>
  );
}
