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
    return <Container error={finalError} />;
  }

  if (!printStats || !displayStatus || !webHooks) {
    return (
      <Container service={service}>
        <div class="inline-flex flex-col" style={{width: '100%'}}>
          <Block label="moonraker.printer_state" />
          <div class="inline-flex flex-row">
            <Block label="moonraker.layers" />
            <Block label="moonraker.print_progress" />
            <Block label="moonraker.print_status" />
          </div>
          <Block label="moonraker.filename"/>
        </div>
      </Container>
    );
  }

  let fileName = "-";
  if(!printStats.result.status.print_stats.filename === "") {
    fileName = printStats.result.status.print_stats.filename;
  }

  if (webHooks.result.status.webhooks.state === "shutdown") {
    return (
      <Container service={service}>
        <div class="inline-flex flex-col" style={{width: '100%'}}>
          <Block label="moonraker.printer_state" value={webHooks.result.status.webhooks.state} />
          <div class="inline-flex flex-row">
            <Block label="moonraker.layers" value="-" />
            <Block label="moonraker.print_progress" value="-" />
            <Block label="moonraker.print_status" value="-" />
          </div>
          <Block label="moonraker.filename" value="-" />
        </div>
      </Container>
    );
  }

  let currentLayer = "-";
  let totalLayer = "-";
  if(!printStats.result.status.print_stats.info.current_layer === "") {
    currentLayer = printStats.result.status.print_stats.info.current_layer;
    totalLayer = printStats.result.status.print_stats.info.total_layer;
  }

  return (
    <Container service={service}>
      <div class="inline-flex flex-col" style={{width: '100%'}}>
        <Block label="moonraker.printer_state" value={webHooks.result.status.webhooks.state} />
        <div class="inline-flex flex-row">
          <Block label="moonraker.layers" value={`${currentLayer} / ${totalLayer}`} />
          <Block label="moonraker.print_progress" value={t("common.percent", { value: (displayStatus.result.status.display_status.progress * 100) })} />
          <Block label="moonraker.print_status" value={printStats.result.status.print_stats.state} />
        </div>
        <Block label="moonraker.filename" value={fileName} />
      </div>
    </Container>
  );
}
