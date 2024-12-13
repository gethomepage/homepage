import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

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
  }

  return (
    <>
      <Container service={service}>
        <Block
          label="frigate.cameras"
          value={t("common.number", {
            value: data.num_cameras,
          })}
        />
        <Block
          label="frigate.uptime"
          value={t("common.duration", {
            value: data.uptime,
          })}
        />
        <Block label="frigate.version" value={data.version} />
      </Container>
      {widget.enableRecentEvents &&
        eventsData?.map((event) => (
          <div
            key={event.id}
            className="text-theme-700 dark:text-theme-200 _relative h-5 rounded-md bg-theme-200/50 dark:bg-theme-900/20 m-1 px-1 flex"
          >
            <div className="text-xs z-10 self-center ml-2 relative h-4 grow mr-2">
              <div className="absolute w-full h-4 whitespace-nowrap text-ellipsis overflow-hidden text-left">
                {event.camera} ({event.label} {t("common.percent", { value: event.score * 100 })})
              </div>
            </div>
            <div className="self-center text-xs flex justify-end mr-1.5 pl-1 z-10 text-ellipsis overflow-hidden whitespace-nowrap">
              {t("common.date", {
                value: event.start_time,
                formatParams: { value: { timeStyle: "short", dateStyle: "medium" } },
              })}
            </div>
          </div>
        ))}
    </>
  );
}
