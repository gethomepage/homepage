import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: tdarrData, error: tdarrError } = useWidgetAPI(widget);

  if (tdarrError) {
    return <Container service={service} error={tdarrError} />;
  }

  if (!tdarrData) {
    return (
      <Container service={service}>
        <Block label="tdarr.queue" />
        <Block label="tdarr.processed" />
        <Block label="tdarr.errored" />
        <Block label="tdarr.saved" />
      </Container>
    );
  }

  const queue = parseInt(tdarrData.table1Count, 10) + parseInt(tdarrData.table4Count, 10);
  const processed = parseInt(tdarrData.table2Count, 10) + parseInt(tdarrData.table5Count, 10);
  const errored = parseInt(tdarrData.table3Count, 10) + parseInt(tdarrData.table6Count, 10);
  const saved = parseFloat(tdarrData.sizeDiff, 10) * 1000000000;

  return (
    <Container service={service}>
      <Block label="tdarr.queue" value={t("common.number", { value: queue })} />
      <Block label="tdarr.processed" value={t("common.number", { value: processed })} />
      <Block label="tdarr.errored" value={t("common.number", { value: errored })} />
      <Block label="tdarr.saved" value={t("common.bytes", { value: saved })} />    
    </Container>
  );
}
