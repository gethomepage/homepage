import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: workflowsData, error: workflowsError } = useWidgetAPI(widget, "workflows");
  const { data: executionsData, error: executionsError } = useWidgetAPI(widget, "executions");

  if (workflowsError || executionsError) {
    const finalError = workflowsError ?? executionsError;
    return <Container service={service} error={finalError} />;
  }
  if (!workflowsData || !executionsData) {
    return (
      <Container service={service}>
        <Block label="n8n.workflows" />
        <Block label="n8n.executions" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="n8n.workflows" value={t("common.number", { value: workflowsData.data.length })} />
      <Block label="n8n.executions" value={t("common.number", { value: executionsData.data.length })} />
    </Container>
  );
}
