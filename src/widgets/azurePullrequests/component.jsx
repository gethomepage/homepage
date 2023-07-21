import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: prData, error: prError } = useWidgetAPI(widget, "pr");
  const { data: myPrData, error: myPrError } = useWidgetAPI(widget, "myPr");

  if (prError || myPrError) {
    const finalError = prError ?? myPrError ;
    return <Container service={service} error={finalError} />;
  }

  if (!prData) {
    return (
      <Container service={service}>
        <Block label="azurePullRequests.totalPrs" />
        <Block label="azurePullRequests-pr.myPrs" />
        <Block label="azurePullRequests.approvedNotCompleted" />
      </Container>
    );
  }

  return ( 
    <Container service={service}>
      <Block label="azurePullRequests.totalPrs" value={t("common.number", { value: prData.count })} />
      <Block label="azurePullRequests.myPrs" value={t("common.number", { value: myPrData.count })} />
      <Block label="azurePullRequests.approvedNotCompleted" value={t("common.number", { value: myPrData.value.filter(item => item.reviewers.some(reviewer => reviewer.vote === 10)).length })} />
    </Container>
  );
}
