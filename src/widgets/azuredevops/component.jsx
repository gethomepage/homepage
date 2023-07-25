import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { userEmail } = widget;
  const { data: prData, error: prError } = useWidgetAPI(widget, "pr");
  const { data: pipelineData, error: pipelineError } = useWidgetAPI(widget, "pipeline");

  if (pipelineError || prError) {
    const finalError = pipelineError ?? prError;
    return <Container service={service} error={finalError} />;
  }

  if (!pipelineData || !Array.isArray(pipelineData.value)) {
    return (
      <Container service={service}>
        <Block label="azuredevops.result" />
        <Block label="azuredevops.totalPrs" />
        <Block label="azuredevops.myPrs" />
        <Block label="azuredevops.approved" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      {pipelineData.value[0].result ? (
        <Block label="azuredevops.result" value={t(`azuredevops.${pipelineData.value[0].result.toString()}`)} />
      ) : (
        <Block label="azuredevops.status" value={t(`azuredevops.${pipelineData.value[0].status.toString()}`)} />
      )}
      
      <Block label="azuredevops.totalPrs" value={t("common.number", { value: prData.count })} />
      <Block
        label="azuredevops.myPrs"
        value={t("common.number", {
          value: prData.value?.filter((item) => item.createdBy.uniqueName.toLowerCase() === userEmail.toLowerCase())
            .length,
        })}
      />
      <Block
        label="azuredevops.approved"
        value={t("common.number", {
          value: prData.value
            ?.filter((item) => item.createdBy.uniqueName.toLowerCase() === userEmail.toLowerCase())
            .filter((item) => item.reviewers.some((reviewer) => reviewer.vote === 10)).length,
        })}
      />

    </Container>
  );
}
