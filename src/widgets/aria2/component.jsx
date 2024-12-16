import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: aria2Data, error: aria2Error } = useWidgetAPI(widget);

  if (aria2Error) {
    return <Container service={service} error={aria2Error} />;
  }

  if (!aria2Data) {
    return (
      <Container service={service}>
        <Block label="aria2.active" />
        <Block label="aria2.waiting" />
        <Block label="aria2.download" />
        <Block label="aria2.upload" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="aria2.active" value={t("common.number", { value: aria2Data.numActive })} />
      <Block label="aria2.waiting" value={t("common.number", { value: aria2Data.numWaiting })} />
      <Block label="aria2.download" value={t("common.byterate", { value: parseInt(aria2Data.downloadSpeed, 10) })} />
      <Block label="aria2.upload" value={t("common.byterate", { value: parseInt(aria2Data.uploadSpeed, 10) })} />
    </Container>
  );
}
