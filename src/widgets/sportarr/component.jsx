import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: wantedData, error: wantedError } = useWidgetAPI(widget, "wanted/missing", { page: 1, pageSize: 1 });
  const { data: queueData, error: queueError } = useWidgetAPI(widget, "queue");
  const { data: leaguesData, error: leaguesError } = useWidgetAPI(widget, "leagues");

  if (wantedError || queueError || leaguesError) {
    const finalError = wantedError ?? queueError ?? leaguesError;
    return <Container service={service} error={finalError} />;
  }

  if (!wantedData || !queueData || !leaguesData) {
    return (
      <Container service={service}>
        <Block label="sportarr.wanted" />
        <Block label="sportarr.queued" />
        <Block label="sportarr.leagues" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="sportarr.wanted" value={t("common.number", { value: wantedData.totalRecords })} />
      <Block label="sportarr.queued" value={t("common.number", { value: queueData.total })} />
      <Block label="sportarr.leagues" value={t("common.number", { value: leaguesData.total })} />
    </Container>
  );
}
