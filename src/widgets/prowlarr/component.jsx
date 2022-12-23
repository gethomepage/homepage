import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";
import { useTranslation } from "react-i18next";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: indexersData, error: indexersError } = useWidgetAPI(widget, "indexer");
  const { data: grabsData, error: grabsError } = useWidgetAPI(widget, "indexerstats");

  if (indexersError || grabsError) {
    const finalError = indexersError ?? grabsError;
    return <Container error={finalError} />;
  }

  if (!indexersData || !grabsData) {
    return (
      <Container service={service}>
        <Block label="prowlarr.enableIndexers" />
        <Block label="prowlarr.numberOfGrabs" />
        <Block label="prowlarr.numberOfQueries" />
        <Block label="prowlarr.numberOfFailGrabs" />
        <Block label="prowlarr.numberOfFailQueries" />
      </Container>
    );
  }

  const indexers = indexersData?.filter((indexer) => indexer.enable === true);

  let numberOfGrabs = 0;
  let numberOfQueries = 0;
  let numberOfFailedGrabs = 0;
  let numberOfFailedQueries = 0;
  grabsData?.indexers?.forEach((element) => {
    numberOfGrabs += element.numberOfGrabs;
    numberOfQueries += element.numberOfQueries;
    numberOfFailedGrabs += numberOfFailedGrabs + element.numberOfFailedGrabs;
    numberOfFailedQueries += numberOfFailedQueries + element.numberOfFailedQueries;
  });

  return (
    <Container service={service}>
      <Block label="prowlarr.enableIndexers" value={t("common.number", { value: indexers.length })} />
      <Block label="prowlarr.numberOfGrabs" value={t("common.number", { value: numberOfGrabs })} />
      <Block label="prowlarr.numberOfQueries" value={t("common.number", { value: numberOfQueries })} />
      <Block label="prowlarr.numberOfFailGrabs" value={t("common.number", { value: numberOfFailedGrabs })} />
      <Block label="prowlarr.numberOfFailQueries" value={t("common.number", { value: numberOfFailedQueries })} />
    </Container>
  );
}
