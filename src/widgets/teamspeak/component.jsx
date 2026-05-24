import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: serverlist, error: serverError } = useWidgetAPI(widget, "serverlist");

  if (serverError) {
    return <Container service={service} error={serverError} />;
  }

  if (!serverlist) {
    return (
      <Container service={service}>
        <Block label="teamspeak.name" />
        <Block label="teamspeak.activeusers" />
        <Block label="teamspeak.status" />
        <Block label="teamspeak.uptime" />
      </Container>
    );
  }

  const {
    virtualserver_clientsonline,
    virtualserver_maxclients,
    virtualserver_name,
    virtualserver_queryclientsonline,
    virtualserver_status,
    virtualserver_uptime,
  } = serverlist.body[0]; // we are only looking at the first virtualserver entry

  return (
    <Container service={service}>
      <Block label="teamspeak.name" value={virtualserver_name} highlightValue={virtualserver_name} />
      <Block
        label="teamspeak.activeusers"
        value={
          t("common.number", { value: virtualserver_clientsonline - virtualserver_queryclientsonline }) +
          "/" +
          t("common.number", { value: virtualserver_maxclients })
        }
      />
      <Block label="teamspeak.status" value={virtualserver_status} />
      <Block label="teamspeak.uptime" value={t("common.duration", { value: virtualserver_uptime })} />
    </Container>
  );
}
