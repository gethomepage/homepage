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

  // use viewable count if it exists, which removes file count of any disabled libraries etc
  // only shows items which are viewable in the tables in the UI

  const table1Count = tdarrData.table1ViewableCount || tdarrData.table1Count;
  const table2Count = tdarrData.table2ViewableCount || tdarrData.table2Count;
  const table3Count = tdarrData.table3ViewableCount || tdarrData.table3Count;
  const table4Count = tdarrData.table4ViewableCount || tdarrData.table4Count;
  const table5Count = tdarrData.table5ViewableCount || tdarrData.table5Count;
  const table6Count = tdarrData.table6ViewableCount || tdarrData.table6Count;

  const queue = parseInt(table1Count, 10) + parseInt(table4Count, 10);
  const processed = parseInt(table2Count, 10) + parseInt(table5Count, 10);
  const errored = parseInt(table3Count, 10) + parseInt(table6Count, 10);
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
