import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";
import Block from "components/services/widget/block";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: summaryData, error: summaryError } = useWidgetAPI(widget, "summary");

  if (summaryError) {
    return <Container error={summaryError} />;
  }

  if (!summaryData) {
    return (
      <Container service={service}>
        <Block label="upptime.sites"/>
        <Block label="upptime.down"/>
        <Block label="upptime.response"/>
      </Container>
    );
  }

  const sitesTotal = summaryData?.length;
  const sitesDown = summaryData?.filter(item => item.status === 'down')?.length;

  const responseSum = summaryData?.reduce((acc, item) => acc + item.time, 0);
  const responseAvg = responseSum / sitesTotal; 

  return (
    <Container service={service}>
      <Block label="upptime.sites" value={t("common.number", { value: sitesTotal })} />
      <Block label="upptime.down" value={t("common.number", { value: sitesDown })} />
      <Block label="upptime.response" value={t("common.number", { value: responseAvg }) + t("upptime.ms")} />
    </Container>
  );
}
