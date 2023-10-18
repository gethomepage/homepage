import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { userEmail, repositoryId } = widget;
  const includePR = userEmail !== undefined && repositoryId !== undefined;
  const { data: prData, error: prError } = useWidgetAPI(widget, includePR ? "pr" : null);
  const { data: pipelineData, error: pipelineError } = useWidgetAPI(widget, "pipeline");

  if (pipelineError || (includePR && (prError || prData?.errorCode !== undefined))) {
    let finalError = pipelineError ?? prError;
    if (includePR && prData?.errorCode !== null) {
      // pr call failed possibly with more specific message
      finalError = { message: prData?.message ?? "Error communicating with Azure API" };
    }
    return <Container service={service} error={finalError} />;
  }

  if (!pipelineData || !Array.isArray(pipelineData.value) || (includePR && !prData)) {
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

      {includePR && <Block label="azuredevops.totalPrs" value={t("common.number", { value: prData.count })} />}
      {includePR && (
        <Block
          label="azuredevops.myPrs"
          value={t("common.number", {
            value: prData.value?.filter((item) => item.createdBy.uniqueName.toLowerCase() === userEmail.toLowerCase())
              .length,
          })}
        />
      )}
      {includePR && (
        <Block
          label="azuredevops.approved"
          value={t("common.number", {
            value: prData.value
              ?.filter((item) => item.createdBy.uniqueName.toLowerCase() === userEmail.toLowerCase())
              .filter((item) => item.reviewers.some((reviewer) => [5, 10].includes(reviewer.vote))).length,
          })}
        />
      )}
    </Container>
  );
}
