import { useTranslation } from "next-i18next";

import Error from "../components/error";
import Container from "../components/container";
import Block from "../components/block";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const [, fsName] = widget.metric.split(':');

  const { data, error } = useWidgetAPI(widget, 'fs', {
    refreshInterval: 1000,
  });

  if (error) {
    return <Container><Error error={error} /></Container>;
  }

  if (!data) {
    return <Container><Block position="bottom-3 left-3">-</Block></Container>;
  }

  const fsData = data.find((item) => item[item.key] === fsName);

  if (!fsData) {
    return <Container><Block position="bottom-3 left-3">-</Block></Container>;
  }

  return (
    <Container>
      <div className="absolute top-0 left-0 right-0 bottom-0">
        <div style={{
          height: `${Math.max(20, (fsData.size/fsData.free))}%`,
        }} className="absolute bottom-0 border-t border-t-theme-500 bg-gradient-to-b from-theme-500/40 to-theme-500/10 w-full" />
          <div style={{
            top: `${100-Math.max(18, (fsData.size/fsData.free))}%`,
          }} className="relative -my-5 ml-2.5 text-xs opacity-50">
            {t("common.bbytes", {
              value: fsData.used,
              maximumFractionDigits: 0,
            })} {t("resources.used")}
          </div>
          <div style={{
            top: `${100-Math.max(22, (fsData.size/fsData.free))}%`,
          }} className="relative my-7 ml-2.5 text-xs opacity-50">
            {t("common.bbytes", {
              value: fsData.free,
              maximumFractionDigits: 0,
            })} {t("resources.free")}
          </div>
      </div>

      <Block position="top-3 right-3">
        <div className="border rounded-md px-1.5 py-0.5 bg-theme-400/30 border-white/30 font-bold opacity-75">
          {t("common.bbytes", {
            value: fsData.size,
            maximumFractionDigits: 1,
          })}
        </div>
      </Block>
    </Container>
  );
}
