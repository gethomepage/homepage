import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function Event({ camera, label, startTime, score, type, thumbnail }) {
  const { i18n } = useTranslation();
  
  const dateFormatter = new Intl.DateTimeFormat(i18n.language, { timeStyle: "short", dateStyle: "medium" });
  const percentFormatter = new Intl.NumberFormat(i18n.language, { style: "percent" });

  return (
    <div className="group text-theme-700 dark:text-theme-200 _relative h-5 rounded-md bg-theme-200/50 dark:bg-theme-900/20 m-1 px-1 flex">
      <div className="text-xs z-10 self-center ml-2 relative h-4 grow mr-2">
        <div className="absolute w-full h-4 whitespace-nowrap text-ellipsis overflow-hidden text-left">
          {camera} ({label} {percentFormatter.format(score)})
        </div>
      </div>
      <div className="self-center text-xs flex justify-end mr-1.5 pl-1 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
        {dateFormatter.format(new Date(startTime))}
      </div>
      {thumbnail &&
        <img
          src={`data:image/png;base64, ${thumbnail}`}
          className="absolute top-0 right-0 w-1/2 z-50 invisible group-hover:visible"
        />}
    </div>
  );
};

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  
  const { data, error } = useWidgetAPI(widget, "stats");
  const { data: eventsData, error: eventsError } = useWidgetAPI(widget, "events");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (eventsError) {
    return <Container service={service} error={eventsError} />;
  }

  if (!data || !eventsData) {
    return (
      <Container service={service}>
        <Block label="frigate.cameras" />
        <Block label="frigate.uptime" />
        <Block label="frigate.version" />
      </Container>
    );
  };

  return (
    <>
      <Container service={service}>
        <Block
          label={data.num_cameras === 1 ? "frigate.camera" : "frigate.cameras"}
          value={t("common.number", {
            value: data.num_cameras,
          })}
        />
        <Block
          label="frigate.uptime"
          value={t("common.uptime", {
            value: data.uptime,
          })}
        />
        <Block
          label="frigate.version"
          value={data.version}
        />
      </Container>
      {widget.enableRecentEvents &&
        (eventsData?.map(event => (
            <Event
              camera={event.camera}
              label={event.label}
              startTime={event.start_time}
              score={event.score}
              type={event.type}
              thumbnail={event.thumbnail}
              key={event.id}
            />
          ))
        )
      }
    </>
  );
}
