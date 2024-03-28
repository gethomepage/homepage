import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: channelsData, error: channelsError } = useWidgetAPI(widget, "status");

  if (channelsError) {
    return <Container service={service} error={channelsError} />;
  }

  if (!channelsData) {
    return (
      <Container service={service}>
        <Block label="channelsdvrserver.shows" />
        <Block label="channelsdvrserver.recordings" />
        <Block label="channelsdvrserver.scheduled" />
        <Block label="channelsdvrserver.passes" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="channelsdvrserver.shows" value={t("common.number", { value: channelsData.stats.groups })} />
      <Block label="channelsdvrserver.recordings" value={t("common.number", { value: channelsData.stats.files })} />
      <Block label="channelsdvrserver.scheduled" value={t("common.number", { value: channelsData.stats.jobs })} />
      <Block label="channelsdvrserver.passes" value={t("common.number", { value: channelsData.stats.rules })} />
    </Container>
  );
}
