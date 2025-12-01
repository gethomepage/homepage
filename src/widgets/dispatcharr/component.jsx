import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: channels, error: channelsError } = useWidgetAPI(widget, "channels");
  const { data: streams, error: streamsError } = useWidgetAPI(widget, "streams");

  widget.fields = ["channels", "streams"];

  let finalError = channelsError || streamsError;

  if (finalError) {
    return <Container service={service} error={finalError} />;
  }
  
  if (!channels || !streams) {
    return (
      <Container service={service}>
      <Block label="dispatcharr.channels" />
      <Block label="dispatcharr.streams" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="dispatcharr.channels" value={channels.length} />
      <Block label="dispatcharr.streams" value={streams.count} />
    </Container>
  );
}
