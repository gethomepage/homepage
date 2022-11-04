import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: channelsData, error: channelsError } = useWidgetAPI(widget, "lineup.json");

  if (channelsError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!channelsData) {
    return (
      <Container service={service}>
        <Block label="hdhomerun.channels" />
        <Block label="hdhomerun.hd" />
      </Container>
    );
  }

const hdChannels = channelsData?.filter((channel) => channel.HD === 1);

  return (
    <Container service={service}>
      <Block label="hdhomerun.channels" value={channelsData.length } />
      <Block label="hdhomerun.hd" value={hdChannels.length} />
      
    </Container>
  );
}
