import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: downloadStatsData, error: downloadStatsError } = useWidgetAPI(widget, "stats");

  if (downloadStatsError) {
    return <Container service={service} error={downloadStatsError} />;
  }

  if (!downloadStatsData) {
    return (
      <Container service={service}>
        <Block label="develancacheui.cachehitbytes" />
        <Block label="develancacheui.cachemissbytes" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block
        label="develancacheui.cachehitbytes"
        value={t("common.bytes", { value: downloadStatsData.totalCacheHitBytes })}
      />
      <Block
        label="develancacheui.cachemissbytes"
        value={t("common.bytes", { value: downloadStatsData.totalCacheMissBytes })}
      />
    </Container>
  );
}
