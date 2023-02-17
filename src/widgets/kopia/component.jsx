import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: kopiaData, error: kopiaError } = useWidgetAPI(widget, "api");

  if (kopiaError) {
    return <Container error={kopiaError} />;
  }

  if (!kopiaData) {
    return (
      <Container service={service}>
        <Block label="kopia.status" />
        <Block label="kopia.size" />
        <Block label="kopia.executiontime" />
        <Block label="kopia.failed" />
      </Container>
    );
  }

  const startTime = new Date(kopiaData.sources[0].lastSnapshot.startTime);
  const endTime = new Date(kopiaData.sources[0].lastSnapshot.endTime);
  const duration = new Date(endTime - startTime);
  const hours = duration.getUTCHours().toString().padStart(2, '0');
  const minutes = duration.getUTCMinutes().toString().padStart(2, '0');
  const seconds = duration.getSeconds().toString().padStart(2, '0');
  const split = ":";
  const time = (hours + split + minutes + split+ seconds);

  return (
    <Container service={service}>
      <Block label="kopia.status" value={ kopiaData.sources[0].status } />
      <Block label="kopia.size" value={t("common.bbytes", { value: kopiaData.sources[0].lastSnapshot.stats.totalSize, maximumFractionDigits: 1 })} />
      <Block label="kopia.executiontime" value={ time } />
      <Block label="kopia.failed" value={t("common.number", { value: kopiaData.sources[0].lastSnapshot.rootEntry.summ.numFailed })} />
    </Container>
  );
}