import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  // 1. Setup Hooks
  const { t } = useTranslation();
  const { widget } = service;

  // 2. Fetch Data
  // "info" refers to the key inside mappings in your widget.js
  const { data, error } = useWidgetAPI(widget, "info");

  // 3. Handle Error State
  if (error) {
    return <Container service={service} error={error} />;
  }

  // 4. Handle Loading State (Skeleton)
  // If data hasn't arrived yet, we show empty blocks
  if (!data) {
    return (
      <Container service={service}>
        <Block label="yourwidget.cpu" />
        <Block label="yourwidget.memory" />
        <Block label="yourwidget.status" />
      </Container>
    );
  }

  // 5. Render Actual Data
  return (
    <Container service={service}>
      {/* - label: The translation key for the title of the block
         - value: The actual data, wrapped in a formatter
      */}
      <Block label="yourwidget.cpu" value={t("common.number", { value: data.cpu_usage, unit: "%" })} />

      <Block label="yourwidget.memory" value={t("common.number", { value: data.memory_usage, unit: "MB" })} />

      <Block label="yourwidget.status" value={data.status_text} />
    </Container>
  );
}
