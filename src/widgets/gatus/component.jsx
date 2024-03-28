import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import Block from "components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");

  if (statusError) {
    return <Container service={service} error={statusError} />;
  }

  if (!statusData) {
    return (
      <Container service={service}>
        <Block label="gatus.up" />
        <Block label="gatus.down" />
        <Block label="gatus.uptime" />
      </Container>
    );
  }

  let sitesUp = 0;
  let sitesDown = 0;
  Object.values(statusData).forEach((site) => {
    const lastResult = site.results[site.results.length - 1];
    if (lastResult?.success === true) {
      sitesUp += 1;
    } else {
      sitesDown += 1;
    }
  });

  // Adapted from https://github.com/bastienwirtz/homer/blob/b7cd8f9482e6836a96b354b11595b03b9c3d67cd/src/components/services/UptimeKuma.vue#L105
  const resultsList = Object.values(statusData).reduce((a, b) => a.concat(b.results), []);
  const percent = resultsList.reduce((a, b) => a + (b?.success === true ? 1 : 0), 0) / resultsList.length;
  const uptime = (percent * 100).toFixed(1);

  return (
    <Container service={service}>
      <Block label="gatus.up" value={t("common.number", { value: sitesUp })} />
      <Block label="gatus.down" value={t("common.number", { value: sitesDown })} />
      <Block label="gatus.uptime" value={t("common.percent", { value: uptime })} />
    </Container>
  );
}
