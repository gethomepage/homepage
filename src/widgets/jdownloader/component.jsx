import { useTranslation } from "next-i18next";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: jdownloaderData, error: jdownloaderAPIError } = useWidgetAPI(widget, "unified", {
    refreshInterval: 30000,
  });

  if (jdownloaderAPIError) {
    return <Container service={service} error={jdownloaderAPIError} />;
  }

  if (!jdownloaderData) {
    return (
      <Container service={service}>
        <Block label="jdownloader.downloadCount" />
        <Block label="jdownloader.downloadTotalBytes" />
        <Block label="jdownloader.downloadBytesRemaining" />
        <Block label="jdownloader.downloadSpeed" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="jdownloader.downloadCount" value={t("common.number", { value: jdownloaderData.downloadCount })} />
      <Block label="jdownloader.downloadTotalBytes" value={t("common.bytes", { value: jdownloaderData.totalBytes })} />
      <Block
        label="jdownloader.downloadBytesRemaining"
        value={t("common.bytes", { value: jdownloaderData.bytesRemaining })}
      />
      <Block label="jdownloader.downloadSpeed" value={t("common.byterate", { value: jdownloaderData.totalSpeed })} />
    </Container>
  );
}
