import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

function StreamEntry({ title, clients, bitrate }) {
  return (
    <div className="text-theme-700 dark:text-theme-200 relative h-5 rounded-md bg-theme-200/50 dark:bg-theme-900/20 m-1 px-1 flex">
      <div className="text-xs z-10 self-center ml-2 relative h-4 grow mr-2">
        <div className="absolute w-full whitespace-nowrap text-ellipsis overflow-hidden text-left">
          {title} - Clients: {clients}
        </div>
      </div>
      <div className="self-center text-xs flex justify-end mr-1.5 pl-1 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
        {bitrate}
      </div>
    </div>
  );
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: channels, error: channelsError } = useWidgetAPI(widget, "channels");
  const { data: streams, error: streamsError } = useWidgetAPI(widget, "streams");

  if (channelsError || streamsError) {
    return <Container service={service} error={channelsError ?? streamsError} />;
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
    <>
      <Container service={service}>
        <Block label="dispatcharr.channels" value={t("common.number", { value: channels?.length ?? 0 })} />
        <Block label="dispatcharr.streams" value={t("common.number", { value: streams?.count ?? 0 })} />
      </Container>
      {widget?.enableActiveStreams &&
        streams?.channels &&
        streams.channels.map((activeStream) => (
          <StreamEntry
            title={activeStream.stream_name}
            clients={activeStream.clients.length}
            bitrate={activeStream.avg_bitrate}
            key={activeStream.stream_name}
          />
        ))}
    </>
  );
}
