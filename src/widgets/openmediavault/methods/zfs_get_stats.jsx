import dynamic from "next/dynamic";
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";

import Error from "../../glances/components/error";
import Container from "../../glances/components/container";
import Block from "../../glances/components/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

const ChartDual = dynamic(() => import("../../glances/components/chart_dual"), { ssr: false });

const POINTS_LIMIT = 15;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const [dataPoints, setDataPoints] = useState(new Array(POINTS_LIMIT).fill({ value: 0 }, 0, POINTS_LIMIT));

  const { data, error } = useWidgetAPI(widget, null, {
    refreshInterval: 5000,
  });

  useEffect(() => {
    if (data?.response) {
      const { hits, misses } = data.response;
      const a = parseInt(hits, 10);
      const b = parseInt(misses, 10);

      setDataPoints((prevDataPoints) => {
        const newDataPoints = [...prevDataPoints, { a, b }];
        if (newDataPoints.length > POINTS_LIMIT) {
          newDataPoints.shift();
        }
        return newDataPoints;
      });
    }
  }, [data]);

  if (error) {
    return (
      <Container>
        <Error error={error} />
      </Container>
    );
  }

  if (!data) {
    return (
      <Container>
        <Block position="bottom-3 left-3">-</Block>
      </Container>
    );
  }

  const { hits, misses, hitsMisses, ratio } = data.response;
  const hitsRatio = Math.round(ratio);
  const missesRatio = 100 - hitsRatio;

  return (
    <Container>
      <ChartDual
        dataPoints={dataPoints}
        label={[t("openmediavault.zfsHits"), t("openmediavault.zfsMisses")]}
        formatter={(value) => value}
      />

      <Block position="bottom-3 left-3">
        <div className="text-xs opacity-50">{`${t("resources.total")}: ${hitsMisses}`}</div>

        <div className="text-xs opacity-75">{`${t("openmediavault.zfsHits")}: ${hits} (${hitsRatio}%)`}</div>
      </Block>

      <Block position="bottom-3 right-3">
        <div className="text-xs opacity-75">{`${t("openmediavault.zfsMisses")}: ${misses} (${missesRatio}%)`}</div>
      </Block>
    </Container>
  );
}
