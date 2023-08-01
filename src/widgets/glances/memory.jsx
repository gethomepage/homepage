import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

const ChartDual = dynamic(() => import("./chart_dual"), { ssr: false });

const pointsLimit = 15;

export default function Component({ service }) {
  const { t } = useTranslation();

  const [dataPoints, setDataPoints] = useState(new Array(pointsLimit).fill({ value: 0 }, 0, pointsLimit));

  const { data, error } = useWidgetAPI(service.widget, 'mem', {
    refreshInterval: 1000,
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
  }, [data]);

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

  return (
    <>
      <div className="absolute -top-1 -left-1 h-[120px] w-[calc(100%+0.5em)] z-0">
        <ChartDual
          dataPoints={dataPoints}
          max={data.total}
          label={[t("resources.used"), t("resources.free")]}
          formatter={(value) => t("common.bytes", {
            value,
            maximumFractionDigits: 0,
          })}
        />
      </div>
      <div className="absolute bottom-3 left-3 z-10 opacity-50 pointer-events-none">
        {data && !error && (
          <>
            {data.free && (
              <div className="text-xs opacity-80">
                {t("common.bytes", {
                  value: data.free,
                  maximumFractionDigits: 0,
                })} {t("resources.free")}
              </div>
            )}

            {data.total && (
              <div className="text-xs font-bold">
                {t("common.bytes", {
                  value: data.total,
                  maximumFractionDigits: 0,
                })} {t("resources.total")}
              </div>
            )}
          </>
        )}
      </div>
      <div className="absolute bottom-3 right-3 z-10 text-xs opacity-80 pointer-events-none">
        {t("common.bytes", {
          value: data.used,
          maximumFractionDigits: 0,
        })} {t("resources.used")}
      </div>
      <div className="h-[68px] overflow-clip" />
    </>
  );
}
