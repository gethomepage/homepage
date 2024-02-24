import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function fromUnits(value) {
  const units = ["B", "K", "M", "G", "T", "P"];
  const [number, unit] = value.split(" ");
  const index = units.indexOf(unit);
  if (index === -1) {
    return 0;
  }
  return parseFloat(number) * 1024 ** index;
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: queueData, error: queueError } = useWidgetAPI(widget, "queue");

  if (queueError) {
    return <Container service={service} error={queueError} />;
  }

  if (!queueData) {
    return (
      <Container service={service}>
        <Block label="sabnzbd.rate" />
        <Block label="sabnzbd.queue" />
        <Block label="sabnzbd.timeleft" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="sabnzbd.rate" value={t("common.byterate", { value: fromUnits(queueData.queue.speed) })} />
      <Block label="sabnzbd.queue" value={t("common.number", { value: queueData.queue.noofslots })} />
      <Block label="sabnzbd.timeleft" value={queueData.queue.timeleft} />
    </Container>
  );
}
