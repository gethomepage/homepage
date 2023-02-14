import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: fileflowsData, error: fileflowsError } = useWidgetAPI(widget, "status");

  if (fileflowsError) {
    return <Container error={fileflowsError} />;
  }

  if (!fileflowsData) {
    return (
      <Container service={service}>
        <Block label="fileflows.queue" />
        <Block label="fileflows.processing" />
        <Block label="fileflows.processed" />
        <Block label="fileflows.time" />
      </Container>
    );
  }
	  
  return (
    <Container service={service}>
      <Block label="fileflows.queue" value={t("common.number", { value: fileflowsData.queue })} />
      <Block label="fileflows.processing" value={t("common.number", { value: fileflowsData.processing })} />
      <Block label="fileflows.processed" value={t("common.number", { value: fileflowsData.processed })} />
      <Block label="fileflows.time" value={fileflowsData.time?.length ? fileflowsData.time : "0:00"} />
    </Container>
  );
}
