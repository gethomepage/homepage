import { useTranslation } from "next-i18next";

import Container from "../components/container";
import Block from "../components/block";

import useWidgetAPI from "utils/proxy/use-widget-api";
import ResolvedIcon from "components/resolvedicon";

const statusMap = {
  running: <ResolvedIcon icon="mdi-circle" width={32} height={32} />,
  paused: <ResolvedIcon icon="mdi-circle-outline" width={32} height={32} />,
};

const defaultInterval = 1000;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { chart, refreshInterval = defaultInterval, version = 3 } = widget;

  const idKey = version === 3 ? "Id" : "id";
  const statusKey = version === 3 ? "Status" : "status";

  const { data, error } = useWidgetAPI(service.widget, `${version}/containers`, {
    refreshInterval: Math.max(defaultInterval, refreshInterval),
  });

  if (error) {
    return <Container service={service} widget={widget} />;
  }

  if (!data) {
    return (
      <Container chart={chart}>
        <Block position="bottom-3 left-3">-</Block>
      </Container>
    );
  }

  data.splice(chart ? 5 : 1);
  let headerYPosition = "top-4";
  let listYPosition = "bottom-4";
  if (chart) {
    headerYPosition = "-top-6";
    listYPosition = "-top-3";
  }

  return (
    <Container chart={chart}>
      <Block position={`${headerYPosition} right-3 left-3`}>
        <div className="flex items-center text-xs">
          <div className="grow" />
          <div className="w-14 text-right italic">{t("resources.cpu")}</div>
          <div className="w-14 text-right">{t("resources.mem")}</div>
        </div>
      </Block>

      <Block position={`${listYPosition} right-3 left-3`}>
        <div className="pointer-events-none text-theme-900 dark:text-theme-200">
          {data.map((item) => (
            <div key={item[idKey]} className="text-[0.75rem] h-[0.8rem]">
              <div className="flex items-center">
                <div className="w-3 h-3 mr-1.5 opacity-50">{statusMap[item[statusKey]]}</div>
                <div className="opacity-75 grow truncate">{item.name}</div>
                <div className="opacity-25 w-14 text-right">{item.cpu_percent.toFixed(1)}%</div>
                <div className="opacity-25 w-14 text-right">
                  {t("common.bytes", {
                    value: item.memory.usage,
                    maximumFractionDigits: 0,
                  })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Block>
    </Container>
  );
}
