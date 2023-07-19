import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: prData, error: prError } = useWidgetAPI(widget, "pr");

  if (prError) {
    const finalError = prError ;
    return <Container service={service} error={finalError} />;
  }

  if (!prData) {
    return (
      <Container service={service}>
        <Block label="azurePullrequests.totalPrs" />
        <Block label="azurePullrequests-pr.myPrs" />
        <Block label="azurePullrequests.approvedNotCompleted" />
      </Container>
    );
  }

  return ( 
    <Container service={service}>
      <Block label="azurePullrequests.totalPrs" value={t("common.number", { value: prData.count })} />
      <Block label="azurePullrequests.myPrs" value={t("common.number", { value: prData.value.filter(item => item.createdBy.uniqueName === service.widget.userEmail).length })} />
      <Block label="azurePullrequests.approvedNotCompleted" value={t("common.number", { value: prData.value.filter(item => item.reviewers.some(reviewer => reviewer.vote === 10)).length })} />
    </Container>
  );
}
