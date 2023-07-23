import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { azureType } = widget;
  const { userEmail } = widget;
  const { data: pipelineData, error: pipelineError } = useWidgetAPI(widget, "pipeline");
  const { data: prData, error: prError } = useWidgetAPI(widget, "pr");

  if (azureType === "Pipeline") {
    if (pipelineError) {
      return <Container service={service} error={pipelineError} />;
    }

    if (!pipelineData || !Array.isArray(pipelineData.value)) {
      return (
        <Container service={service}>
          <Block label="azureDevOps.result" />
          <Block label="azureDevOps.buildId" />
        </Container>
      );
    }

    return (
      <Container service={service}>
        {pipelineData.value[0].result ? (
          <Block label="azureDevOps.result" value={t(`azureDevOps.${pipelineData.value[0].result.toString()}`)} />
        ) : (
          <Block label="azureDevOps.status" value={t(`azureDevOps.${pipelineData.value[0].status.toString()}`)} />
        )}
        <Block label="azureDevOps.buildId" value={pipelineData.value[0].id} />
      </Container>
    );
  }
  else if (azureType === "PullRequest") {


    if (prError) {
      return <Container service={service} error={prError} />;
    }

    if (!prData) {
      return (
        <Container service={service}>
          <Block label="azureDevOps.totalPrs" />
          <Block label="azureDevOps.myPrs" />
          <Block label="azureDevOps.approvedNotCompleted" />
        </Container>
      );
    }

    return (
      <Container service={service}>
        <Block label="azureDevOps.totalPrs" value={t("common.number", { value: prData.count })} />
        <Block
          label="azureDevOps.myPrs"
          value={t("common.number", {
            value: prData.value.filter((item) => item.createdBy.uniqueName.toLowerCase() === userEmail.toLowerCase())
              .length,
          })}
        />
        <Block
          label="azureDevOps.approvedNotCompleted"
          value={t("common.number", {
            value: prData.value
              .filter((item) => item.createdBy.uniqueName.toLowerCase() === userEmail.toLowerCase())
              .filter((item) => item.reviewers.some((reviewer) => reviewer.vote === 10)).length,
          })}
        />
      </Container>
    );
  }
}
