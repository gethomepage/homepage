import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: aria2cData, error: aria2cError } = useWidgetAPI(widget);

  if (aria2cError) {
    return <Container service={service} error={aria2cError} />;
  }

  if (!aria2cData) {
    return (
      <Container service={service}>
        <Block label="aria2c.active" />
        <Block label="aria2c.waiting" />
        <Block label="aria2c.download" />
        <Block label="aria2c.upload" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="aria2c.active" value={t("common.number", { value: aria2cData.numActive })} />
      <Block label="aria2c.waiting" value={t("common.number", { value: aria2cData.numWaiting })} />
      <Block label="aria2c.download" value={t("common.byterate", { value: parseInt(aria2cData.downloadSpeed, 10) })} />
      <Block label="aria2c.upload" value={t("common.byterate", { value: parseInt(aria2cData.uploadSpeed, 10) })} />
    </Container>
  );
}
