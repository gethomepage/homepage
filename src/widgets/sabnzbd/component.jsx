import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: queueData, error: queueError } = useSWR(formatProxyUrl(config, "queue"));

  if (queueError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!queueData) {
    return (
      <Container>
        <Block label={t("sabnzbd.rate")} />
        <Block label={t("sabnzbd.queue")} />
        <Block label={t("sabnzbd.timeleft")} />
      </Container>
    );
  }

  return (
    <Container>
      <Block label={t("sabnzbd.rate")} value={`${queueData.queue.speed}B/s`} />
      <Block label={t("sabnzbd.queue")} value={t("common.number", { value: queueData.queue.noofslots })} />
      <Block label={t("sabnzbd.timeleft")} value={queueData.queue.timeleft} />
    </Container>
  );
}
