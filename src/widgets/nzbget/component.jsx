import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation("common");

  const { widget } = service;

  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");

  if (statusError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!statusData) {
    return (
      <Container service={service}>
        <Block label="nzbget.rate" />
        <Block label="nzbget.remaining" />
        <Block label="nzbget.downloaded" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="nzbget.rate" value={t("common.bitrate", { value: statusData.DownloadRate })} />
      <Block
        label="nzbget.remaining"
        value={t("common.bytes", { value: statusData.RemainingSizeMB * 1024 * 1024 })}
      />
      <Block
        label="nzbget.downloaded"
        value={t("common.bytes", { value: statusData.DownloadedSizeMB * 1024 * 1024 })}
      />
    </Container>
  );
}
