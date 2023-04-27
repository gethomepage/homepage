import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

const calculateAverage = (key, data) => {
  const count = data.length;
  const sum = data.reduce((a,b) => a + b[key], 0);
  const average = (sum / count).toFixed(1);

  return average;
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: nzbhydra2Data, error: nzbhydra2Error } = useWidgetAPI(widget, "stats");

  if (nzbhydra2Error) {
    return <Container error={nzbhydra2Error} />;
  }

  if (!nzbhydra2Data) {
    return (
      <Container service={service}>
        <Block label="nzbhydra2.indexersenabled" />
        <Block label="nzbhydra2.mostpopular" />
        <Block label="nzbhydra2.responsetime" />
      </Container>
    );
  }

  const indexerCount = nzbhydra2Data.numberOfConfiguredIndexers;
  const enabledIndexers = nzbhydra2Data.numberOfEnabledIndexers;

  
  const highestDailyAccesses = Math.max(...nzbhydra2Data.indexerApiAccessStats.map(indexer => indexer.averageAccessesPerDay));
  const mostPopularIndexer = nzbhydra2Data.indexerApiAccessStats.find((indexer) => indexer.averageAccessesPerDay === highestDailyAccesses);
  
  const averageResponseTime = calculateAverage("avgResponseTime", nzbhydra2Data.avgResponseTimes);
  
  return (
    <Container service={service}>
      <Block label="nzbhydra2.indexersenabled" value={`${enabledIndexers}/${indexerCount}` } />
      <Block label="nzbhydra2.mostpopular" value={ mostPopularIndexer.indexerName } />
      <Block label="nzbhydra2.responsetime" value={t("common.ms", { value: averageResponseTime, style: "unit", unit: "millisecond" })} />
    </Container>
  );
}
