import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { data: serverData, error: serverError } = useWidgetAPI(widget, "status");
  const { t } = useTranslation();

  if (serverError) {
    return <Container service={service} error={serverError} />;
  }

  // Default fields
  if (widget.fields == null || widget.fields.length === 0) {
    widget.fields = ["map", "currentPlayers", "ping"];
  }
  const MAX_ALLOWED_FIELDS = 4;
  // Limits max number of displayed fields
  if (widget.fields != null && widget.fields.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (!serverData) {
    return (
      <Container service={service}>
        <Block label="gamedig.status" />
        <Block label="gamedig.name" />
        <Block label="gamedig.map" />
        <Block label="gamedig.currentPlayers" />
        <Block label="gamedig.players" />
        <Block label="gamedig.maxPlayers" />
        <Block label="gamedig.bots" />
        <Block label="gamedig.ping" />
      </Container>
    );
  }

  const status = serverData.online ? (
    <span className="text-green-500">{t("gamedig.online")}</span>
  ) : (
    <span className="text-red-500">{t("gamedig.offline")}</span>
  );
  const name = serverData.online ? serverData.name : "-";
  const map = serverData.online ? serverData.map : "-";
  const currentPlayers = serverData.online ? `${serverData.players} / ${serverData.maxplayers}` : "-";
  const players = serverData.online ? `${serverData.players}` : "-";
  const maxPlayers = serverData.online ? `${serverData.maxplayers}` : "-";
  const bots = serverData.online ? `${serverData.bots}` : "-";
  const ping = serverData.online
    ? `${t("common.ms", { value: serverData.ping, style: "unit", unit: "millisecond" })}`
    : "-";

  return (
    <Container service={service}>
      <Block label="gamedig.status" value={status} />
      <Block label="gamedig.name" value={name} />
      <Block label="gamedig.map" value={map} />
      <Block label="gamedig.currentPlayers" value={currentPlayers} />
      <Block label="gamedig.players" value={players} />
      <Block label="gamedig.maxPlayers" value={maxPlayers} />
      <Block label="gamedig.bots" value={bots} />
      <Block label="gamedig.ping" value={ping} />
    </Container>
  );
}
