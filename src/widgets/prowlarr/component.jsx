import { useTranslation } from "react-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: grabsData, error: grabsError } = useWidgetAPI(widget, "indexerstats");

  if (grabsError) {
    return <Container service={service} error={grabsError} />;
  }

  if (!grabsData) {
    return (
      <Container service={service}>
        <Block label="prowlarr.numberOfGrabs" />
        <Block label="prowlarr.numberOfQueries" />
        <Block label="prowlarr.numberOfFailGrabs" />
        <Block label="prowlarr.numberOfFailQueries" />
      </Container>
    );
  }

  let numberOfGrabs = 0;
  let numberOfQueries = 0;
  let numberOfFailedGrabs = 0;
  let numberOfFailedQueries = 0;
  grabsData?.indexers?.forEach((element) => {
    numberOfGrabs += element.numberOfGrabs;
    numberOfQueries += element.numberOfQueries;
    numberOfFailedGrabs += element.numberOfFailedGrabs;
    numberOfFailedQueries += element.numberOfFailedQueries;
  });

  return (
    <Container service={service}>
      <Block label="prowlarr.numberOfGrabs" value={t("common.number", { value: numberOfGrabs })} />
      <Block label="prowlarr.numberOfQueries" value={t("common.number", { value: numberOfQueries })} />
      <Block label="prowlarr.numberOfFailGrabs" value={t("common.number", { value: numberOfFailedGrabs })} />
      <Block label="prowlarr.numberOfFailQueries" value={t("common.number", { value: numberOfFailedQueries })} />
    </Container>
  );
}
