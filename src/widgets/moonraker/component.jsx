import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: mr_print_stats, error: mre_print_stats } = useWidgetAPI(widget, "print_stats");
  const { data: mr_display_status, error: mre_display_status } = useWidgetAPI(widget, "display_status");
  const { data: mr_webhooks, error: mre_webhooks } = useWidgetAPI(widget, "webhooks");

  if (mre_print_stats || mre_display_status || mre_webhooks) {
    const finalError = mre_print_stats ?? mre_display_status ?? mre_webhooks;
    return <Container error={finalError} />;
  }

  if (!mr_print_stats || !mr_display_status || !mr_webhooks) {
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

  const filename = "-";
  if(!mr_print_stats.result.status.print_stats.filename == "") {
    filename = mr_print_stats.result.status.print_stats.filename;
  }

  if (mr_webhooks.result.status.webhooks.state == "shutdown") {
    return (
      <Container service={service}>
        <div class="inline-flex flex-col" style={{width: '100%'}}>
          <Block label="moonraker.printer_state" value={mr_webhooks.result.status.webhooks.state} />
          <div class="inline-flex flex-row">
            <Block label="moonraker.layers" value={"-"} />
            <Block label="moonraker.print_progress" value={"-"} />
            <Block label="moonraker.print_status" value={"-"} />
          </div>
          <Block label="moonraker.filename" value={"-"} />
        </div>
      </Container>
    );
  }

  const current_layer = "-";
  const total_layer = "-";
  if(!mr_print_stats.result.status.print_stats.info.current_layer == "") {
    current_layer = mr_print_stats.result.status.print_stats.info.current_layer;
    total_layer = mr_print_stats.result.status.print_stats.info.total_layer;
  }

  return (
    <Container service={service}>
      <div class="inline-flex flex-col" style={{width: '100%'}}>
        <Block label="moonraker.printer_state" value={mr_webhooks.result.status.webhooks.state} />
        <div class="inline-flex flex-row">
          <Block label="moonraker.layers" value={`${current_layer} / ${total_layer}`} />
          <Block label="moonraker.print_progress" value={t("common.percent", { value: (mr_display_status.result.status.display_status.progress * 100) })} />
          <Block label="moonraker.print_status" value={mr_print_stats.result.status.print_stats.state} />
        </div>
        <Block label="moonraker.filename" value={filename} />
      </div>
    </Container>
  );
}
