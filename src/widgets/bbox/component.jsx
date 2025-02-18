import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: bboxData, error: bboxError } = useWidgetAPI(widget, "info");


  if (bboxError) {
    return <Container service={service} error={bboxError} />;
  }

  if (!bboxData) {
    return (
      <Container service={service}>
        <Block label="widget.status" />
        <Block label="bbox.modelname" />
        <Block label="bbox.uptime" />
        <Block label="bbbox.wanIPAddress" />
        <Block label="bbox.devices"  />
      </Container>
    );
  }

  const connectedDevices = bboxData.devices.filter(element => element.active === 1).length;;

  return (
    <Container service={service}>
      <Block label="widget.status" value={t(`bbox.${bboxData.status}`)} />
      <Block label="bbox.modelname" value={bboxData.modelname} />
      <Block label="bbox.uptime" value={t("common.duration", { value: bboxData.uptime })} />
      <Block label="bbox.wanIPAddress" value={bboxData.wanIPAddress} />
      <Block label="bbox.devices" value={`${connectedDevices} / ${bboxData.devices.length}`} />
    </Container>
  );
}
