import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const version = widget.version ?? 1;

  const { data: fileflowsData, error: fileflowsError } = useWidgetAPI(widget, version === 2 ? "status_v2" : "status");

  if (fileflowsError) {
    return <Container service={service} error={fileflowsError} />;
  }

  if (!fileflowsData) {
    return (
      <Container service={service}>
        <Block label="fileflows.queue" />
        <Block label="fileflows.processing" />
        <Block label="fileflows.processed" />
        {version === 2 ? <Block label="fileflows.failed" /> : <Block label="fileflows.time" />}
      </Container>
    );
  }

  if (version === 2) {
    return (
      <Container service={service}>
        <Block label="fileflows.queue" value={t("common.number", { value: fileflowsData.Unprocessed })} />
        <Block label="fileflows.processing" value={t("common.number", { value: fileflowsData.Processing })} />
        <Block label="fileflows.processed" value={t("common.number", { value: fileflowsData.Processed })} />
        <Block label="fileflows.failed" value={t("common.number", { value: fileflowsData.Failed })} />
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
