import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: channelsData, error: channelsError } = useWidgetAPI(widget, "lineup.json");
  const { data: hdData, error: hdError } = useWidgetAPI(widget, "hd");

  if (channelsError || hdError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!channelsData || !hdData) {
    return (
      <Container service={service}>
        <Block label="hdhomerun.channels" />
        <Block label="hdhomerun.hd" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="hdhomerun.channels" value={t("common.number", { value: channelsData.length })} />
      <Block label="hdhomerun.hd" value={t("common.number", { value: hdData.have })} />
    </Container>
  );
}
