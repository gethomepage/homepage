import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: seriesData, error: seriesError } = useWidgetAPI(widget, "series");
  const { data: issuesData, error: issuesError } = useWidgetAPI(widget, "issues");
  const { data: wantedData, error: wantedError } = useWidgetAPI(widget, "wanted");

  if (seriesError || issuesError || wantedError) {
    const finalError = seriesError ?? issuesError ?? wantedError;
    return <Container service={service} error={finalError} />;
  }

  if (!seriesData || !issuesData || !wantedData) {
    return (
      <Container service={service}>
        <Block label="mylar.series" />
        <Block label="mylar.issues" />
        <Block label="mylar.wanted" />
      </Container>
    );
  }

  const totalIssues = issuesData.data.reduce((acc, series) => acc + series.totalIssues, 0);

  return (
    <Container service={service}>
      <Block label="mylar.series" value={t("common.number", { value: seriesData.data.length })} />  
      <Block label="mylar.issues" value={t("common.number", { value: totalIssues })} />
      <Block label="mylar.wanted" value={t("common.number", { value: wantedData.issues.length })} />
    </Container>
  );
}
