import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const ChartDual = dynamic(() => import("./chart_dual"), { ssr: false });

const pointsLimit = 15;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const [, interfaceName] = widget.metric.split(':');

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ value: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(widget, 'network', {
    refreshInterval: 1000,
  });

  useEffect(() => {
    if (data) {
      const interfaceData = data.find((item) => item[item.key] === interfaceName);

      if (interfaceData) {
        setDataPoints((prevDataPoints) => {
          const newDataPoints = [...prevDataPoints, { a: interfaceData.tx, b: interfaceData.rx }];
            if (newDataPoints.length > pointsLimit) {
                newDataPoints.shift();
            }
            return newDataPoints;
        });
      }
    }
  }, [data, interfaceName]);

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
  const interfaceData = data.find((item) => item[item.key] === interfaceName);

  if (!interfaceData) {
    return <div>
      <div className="h-[68px] overflow-clip" />
    </div>;
  }

  return (
    <>
      <div className="absolute -top-1 -left-1 h-[120px] w-[calc(100%+0.5em)] z-0">
        <ChartDual
          dataPoints={dataPoints}
          label={[t("docker.tx"), t("docker.rx")]}
          formatter={(value) => t("common.byterate", {
            value,
            maximumFractionDigits: 0,
          })}
        />
      </div>
      <div className="absolute bottom-3 left-3 z-10 text-xs opacity-80 pointer-events-none">
        {interfaceData && interfaceData.interface_name && (
            <div className="text-xs opacity-80">
              {interfaceData.interface_name}
            </div>
        )}
        {t("common.bitrate", {
          value: interfaceData.tx,
          maximumFractionDigits: 0,
        })} {t("docker.tx")}
      </div>
      <div className="absolute bottom-3 right-3 z-10 text-xs opacity-80 pointer-events-none">
        {t("common.bitrate", {
          value: interfaceData.rx,
          maximumFractionDigits: 0,
        })} {t("docker.rx")}
      </div>
      <div className="h-[68px] overflow-clip" />
    </>
  );
}
