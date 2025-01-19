import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: printStats, error: printStatsError } = useWidgetAPI(widget, "print_stats");
  const { data: displayStatus, error: displayStatsError } = useWidgetAPI(widget, "display_status");
  const { data: webHooks, error: webHooksError } = useWidgetAPI(widget, "webhooks");

  if (printStatsError || displayStatsError || webHooksError) {
    const finalError = printStatsError ?? displayStatsError ?? webHooksError;
    return <Container service={service} error={finalError} />;
  }

  if (!printStats || !displayStatus || !webHooks) {
    return (
      <Container service={service}>
        <Block label="moonraker.printer_state" />
      </Container>
    );
  }

  if (webHooks.result.status.webhooks.state === "shutdown") {
    return (
      <Container service={service}>
        <Block label="moonraker.printer_state" value={webHooks.result.status.webhooks.state} />
      </Container>
    );
  }

  const printStatsInfo = printStats.result.status.print_stats.info ?? {};
  const totalDurationSeconds = printStats.result.status.print_stats.total_duration ?? 0;
  const fileName = printStats.result.status.print_stats.filename;
  const { current_layer: currentLayer = "-", total_layer: totalLayer = "-" } = printStatsInfo;

  return (
    <>
      <Container service={service}>
        {/* current_layer and total_layer variables are not available if not exposed by the slicer */}
        {currentLayer && totalLayer ? <Block label="moonraker.layers" value={`${currentLayer} / ${totalLayer}`} /> : null}
        <Block label="moonraker.print_progress" value={t("common.percent", { value: displayStatus.result.status.display_status.progress * 100 })} />
        {totalDurationSeconds > 0 ? <Block label="moonraker.time" value={t("common.duration", {value: totalDurationSeconds})} /> : null }
        <Block label="moonraker.print_status" value={printStats.result.status.print_stats.state} />
      </Container>
      {fileName ? <div className="flex flex-col pb-1 mx-1">
        <div
          className="text-theme-700 dark:text-theme-200 text-xs relative h-5 w-full rounded-md bg-theme-200/50 dark:bg-theme-900/20 mt-1">
          <span className="absolute left-2 text-xs mt-[2px] w-full truncate pr-3">{fileName}</span>
        </div>
      </div> : null }
    </>
  );
}
