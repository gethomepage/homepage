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
  
  function fromTime(value) {
      if (!value) {
		fileflowsData.time = "0:00";
		return fileflowsData.time;
	  }
  return fileflowsData.time;
  }
	  
  return (
    <Container service={service}>
      <Block label="queue" value={t("common.number", { value: fileflowsData.queue })} />
      <Block label="processing" value={t("common.number", { value: fileflowsData.processing })} />
      <Block label="processed" value={t("common.number", { value: fileflowsData.processed })} />
      <Block label="time" value={fromTime(fileflowsData.time)} />
    </Container>
  );
}
