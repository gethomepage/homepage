import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  
  const { widget } = service;

  const { data: pipelineData, error: pipelineError } = useWidgetAPI(widget);

  if (pipelineError) {
    return <Container service={service} error={pipelineError} />;
  }

  if (!pipelineData || !Array.isArray(pipelineData.value)) {
    return (
      <Container service={service}>
        <Block label="azurePipelines.result" />
        <Block label="azurePipelines.buildId" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      {pipelineData.value[0].result ? 
        <Block label="azurePipelines.result" value={t(`azurePipelines.${pipelineData.value[0].result.toString()}`)} /> :
        <Block label="azurePipelines.status" value={t(`azurePipelines.${pipelineData.value[0].status.toString()}`)} />
      }
      <Block label="azurePipelines.buildId" value= { pipelineData.value[0].id } />
    </Container>
  );
}
