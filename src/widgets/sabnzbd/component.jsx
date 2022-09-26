import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Widget from "components/services/widgets/widget";
import Block from "components/services/widgets/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: queueData, error: queueError } = useSWR(formatProxyUrl(config, "queue"));

  if (queueError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!queueData) {
    return (
      <Widget>
        <Block label={t("sabnzbd.rate")} />
        <Block label={t("sabnzbd.queue")} />
        <Block label={t("sabnzbd.timeleft")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("sabnzbd.rate")} value={`${queueData.queue.speed}B/s`} />
      <Block label={t("sabnzbd.queue")} value={t("common.number", { value: queueData.queue.noofslots })} />
      <Block label={t("sabnzbd.timeleft")} value={queueData.queue.timeleft} />
    </Widget>
  );
}
