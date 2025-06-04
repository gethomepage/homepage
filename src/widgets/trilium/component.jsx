import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import { FiFileText, FiPaperclip } from "react-icons/fi";
import { RiStackLine } from "react-icons/ri";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: metricsData, error: metricsError } = useWidgetAPI(widget, "metrics");

  if (metricsError) {
    return <Container service={service} error={metricsError} />;
  }

  if (!metricsData) {
    return (
      <Container service={service}>
        <Block label="trilium.version" />
        <Block label="trilium.notesCount" />
        <Block label="trilium.attachmentsCount" />
      </Container>
    );
  }

  const version = metricsData.version?.app;
  const notesCount = metricsData.database?.activeNotes || 0;
  const attachmentsCount = metricsData.database?.activeAttachments || 0;

  return (
    <Container service={service}>
      <Block icon={RiStackLine} label="trilium.version" value={version ? `v${version}` : t("trilium.unknown")} />
      <Block icon={FiFileText} label="trilium.notesCount" value={t("common.number", { value: notesCount })} />
      <Block
        icon={FiPaperclip}
        label="trilium.attachmentsCount"
        value={t("common.number", { value: attachmentsCount })}
      />
    </Container>
  );
}
