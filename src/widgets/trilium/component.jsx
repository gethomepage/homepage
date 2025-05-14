import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";
import { RiStackLine } from "react-icons/ri";
import { FiFileText, FiPaperclip } from "react-icons/fi";
import useSWR from "swr";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  // Fetch app info for version and stats
  const { data: appInfo, error: appInfoError } = useWidgetAPI(widget, "app-info");

  // Fetch all notes using search API
  const { data: notesData, error: notesError } = useWidgetAPI(
    widget,
    "allnotes",
    {
      refreshInterval: 60000 // refresh every minute
    }
  );

  if (appInfoError || notesError) {
    const error = appInfoError || notesError;
    return <Container service={service} error={error} />;
  }

  if (!appInfo || !notesData) {
    return (
      <Container service={service}>
        <Block label="trilium.version" />
        <Block label="trilium.notesCount" />
        <Block label="trilium.attachmentsCount" />
      </Container>
    );
  }

  // Calculate total notes count and attachment count
  const notesCount = notesData?.results?.length || 0;

  // Count notes that don't have 'text' in the mime type
  const attachmentsCount = notesData?.results?.filter(note =>
    note.mime && !note.mime.includes('text')
  )?.length || 0;

  return (
    <Container service={service}>
      <Block
        icon={RiStackLine}
        label="trilium.version"
        value={("v" + appInfo.appVersion) || t("trilium.unknown")}
      />
      <Block
        icon={FiFileText}
        label="trilium.notesCount"
        value={t("common.number", { value: notesCount })}
      />
      <Block
        icon={FiPaperclip}
        label="trilium.attachmentsCount"
        value={t("common.number", { value: attachmentsCount })}
      />
    </Container>
  );
}
