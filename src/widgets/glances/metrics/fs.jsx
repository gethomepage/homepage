import { useTranslation } from "next-i18next";

import Container from "../components/container";
import Block from "../components/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

const defaultInterval = 1000;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { chart, refreshInterval = defaultInterval, version = 3 } = widget;
  const [, fsName] = widget.metric.split("fs:");
  const diskUnits = widget.diskUnits === "bbytes" ? "common.bbytes" : "common.bytes";

  const { data, error } = useWidgetAPI(widget, `${version}/fs`, {
    refreshInterval: Math.max(defaultInterval, refreshInterval),
  });

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

  const fsData = data.find((item) => item[item.key] === fsName);

  if (!fsData) {
    return (
      <Container chart={chart}>
        <Block position="bottom-3 left-3">-</Block>
      </Container>
    );
  }

  return (
    <Container chart={chart}>
      {chart && (
        <div className="absolute -top-2 -left-2 -right-2 -bottom-2">
          <div
            style={{
              height: `${Math.max(20, (140 * (fsData.size - fsData.free)) / fsData.size)}px`,
            }}
            className="absolute bottom-0 border-t border-t-theme-500 bg-gradient-to-b from-theme-500/40 to-theme-500/10 w-full"
          />
        </div>
      )}

      <Block position="bottom-3 left-3">
        {fsData.used && chart && (
          <div className="text-xs opacity-50">
            {t(diskUnits, {
              value: fsData.used,
              maximumFractionDigits: 1,
            })}{" "}
            {t("resources.used")}
          </div>
        )}

        <div className="text-xs opacity-75">
          {t(diskUnits, {
            value: fsData.free,
            maximumFractionDigits: 1,
          })}{" "}
          {t("resources.free")}
        </div>
      </Block>

      {!chart && (
        <Block position="top-3 right-3">
          {fsData.used && (
            <div className="text-xs opacity-50">
              {t(diskUnits, {
                value: fsData.used,
                maximumFractionDigits: 1,
              })}{" "}
              {t("resources.used")}
            </div>
          )}
        </Block>
      )}

      <Block position="bottom-3 right-3">
        <div className="text-xs opacity-75">
          {t(diskUnits, {
            value: fsData.size,
            maximumFractionDigits: 1,
          })}{" "}
          {t("resources.total")}
        </div>
      </Block>
    </Container>
  );
}
