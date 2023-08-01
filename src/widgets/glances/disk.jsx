import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const ChartDual = dynamic(() => import("./chart_dual"), { ssr: false });

const pointsLimit = 15;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const [, diskName] = widget.metric.split(':');

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ read_bytes: 0, write_bytes: 0, time_since_update: 0 }, 0, pointsLimit));
  const [ratePoints, setRatePoints] = useState(new Array(pointsLimit).fill({ a: 0, b: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(service.widget, 'diskio', {
    refreshInterval: 1000,
  });

  const calculateRates = (d) => d.map(item => ({
              a: item.read_bytes / item.time_since_update,
              b: item.write_bytes / item.time_since_update
          }));

  useEffect(() => {
    if (data) {
      const diskData = data.find((item) => item.disk_name === diskName);

      setDataPoints((prevDataPoints) => {
        const newDataPoints = [...prevDataPoints, diskData];
          if (newDataPoints.length > pointsLimit) {
              newDataPoints.shift();
          }
          return newDataPoints;
      });
    }
  }, [data, diskName]);

  useEffect(() => {
    setRatePoints(calculateRates(dataPoints));
  }, [dataPoints]);

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

  const diskData = data.find((item) => item.disk_name === diskName);

  if (!diskData) {
    return <div>
      <div className="h-[68px] overflow-clip" />
    </div>;
  }

  const diskRates = calculateRates(dataPoints);
  const currentRate = diskRates[diskRates.length - 1];

  return (
    <>
      <div className="absolute -top-1 -left-1 h-[120px] w-[calc(100%+0.5em)] z-0">
      <ChartDual
          dataPoints={ratePoints}
          label={[t("glances.read"), t("glances.write")]}
          max={diskData.critical}
          formatter={(value) => t("common.bitrate", {
            value,
            })}
        />
      </div>
      <div className="absolute bottom-3 left-3 opacity-50 z-10 pointer-events-none">
        {currentRate && !error && (
          <>
            <div className="text-xs opacity-80">
              {t("common.bitrate", {
                value: currentRate.a,
              })} {t("glances.read")}
            </div>
            <div className="text-xs opacity-80">
              {t("common.bitrate", {
                value: currentRate.b,
              })} {t("glances.write")}
            </div>
          </>
        )}
      </div>
      <div className="absolute bottom-3 right-3 z-10 text-xs opacity-80 pointer-events-none">
        {t("common.bitrate", {
          value: currentRate.a + currentRate.b,
        })}
      </div>
      <div className="h-[68px] overflow-clip" />
    </>
  );
}
