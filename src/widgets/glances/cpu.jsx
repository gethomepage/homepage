import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const Chart = dynamic(() => import("./chart"), { ssr: false });

const pointsLimit = 15;

export default function Component({ service }) {
  const { t } = useTranslation();

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ value: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(service.widget, 'cpu', {
    refreshInterval: 1000,
  });

  const { data: systemData, error: systemError } = useWidgetAPI(service.widget, 'system');

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
  }, [data]);

  if (error) {
    return <div>
    <div className="h-[68px] overflow-clip">
      <div className="absolute bottom-2 left-2 z-20 text-red-400 text-xs opacity-75">
      {t("widget.api_error")}
      </div>
    </div>
  </div>;
  }

  if (!data) {
    return <div>
    <div className="h-[68px] overflow-clip">
      <div className="absolute bottom-2 left-2 z-20 text-xs opacity-75">
        -
      </div>
    </div>
  </div>;
  }

  return (
    <>
      <div className="absolute -top-1 -left-1 h-[120px] w-[calc(100%+0.5em)] z-0">
      <Chart
          dataPoints={dataPoints}
          label={[t("resources.used")]}
          formatter={(value) => t("common.number", {
            value,
            style: "unit",
            unit: "percent",
            maximumFractionDigits: 0,
            })}
        />
      </div>
      <div className="absolute bottom-3 left-3 opacity-50 z-10 pointer-events-none">
        {systemData && !systemError && (
          <>
            {systemData.linux_distro && (
              <div className="text-xs opacity-80">
                {systemData.linux_distro}
              </div>
            )}
            {systemData.os_version && (
              <div className="text-xs opacity-80">
                {systemData.os_version}
              </div>
            )}
            {systemData.hostname && (
              <div className="text-xs font-bold">
                {systemData.hostname}
              </div>
            )}
          </>
        )}
      </div>
      <div className="absolute bottom-3 right-3 z-10 text-xs opacity-80 pointer-events-none">
        {t("common.number", {
          value: data.total,
          style: "unit",
          unit: "percent",
          maximumFractionDigits: 0,
        })} {t("resources.used")}
      </div>
      <div className="h-[68px] overflow-clip" />
    </>
  );
}
