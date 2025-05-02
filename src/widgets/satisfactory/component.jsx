import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import { formatDuration, formatInternalName } from "./transforms";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const SATISFACTORY_DEFAULT_FIELDS = ["session", "players", "state", "duration"];
  const MAX_ALLOWED_FIELDS = 4;
  const { widget } = service;

  const { data: serverData, error: serverError } = useWidgetAPI(widget);
  if (serverError) {
    return <Container service={service} error={serverError} />;
  }

  if (!widget.fields?.length > 0) {
    widget.fields = SATISFACTORY_DEFAULT_FIELDS;
  } else if (widget.fields.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (!serverData) {
    return (
      <Container service={service}>
        <Block label="satisfactory.session" />
        <Block label="satisfactory.players" />
        <Block label="satisfactory.state" />
        <Block label="satisfactory.duration" />
        <Block label="satisfactory.gamephase" />
        <Block label="satisfactory.techtier" />
        <Block label="satisfactory.milestone" />
        <Block label="satisfactory.tickrate" />
      </Container>
    );
  }

  const playerCount = `${serverData?.numConnectedPlayers || "0"} / ${serverData?.playerLimit || "0"}`;
  const pausedState = serverData?.isGamePaused === true ? "Paused" : "Running";

  return (
    <Container service={service}>
      <Block label="satisfactory.session" value={serverData?.activeSessionName || "N/A"} />
      <Block label="satisfactory.players" value={playerCount || "N/A"} />
      <Block label="satisfactory.state" value={pausedState || "N/A"} />
      <Block label="satisfactory.duration" value={formatDuration(serverData?.totalGameDuration) || "N/A"} />
      <Block label="satisfactory.gamephase" value={formatInternalName.gamephase(serverData?.gamePhase) || "N/A"} />
      <Block label="satisfactory.techtier" value={serverData?.techTier || "N/A"} />
      <Block
        label="satisfactory.milestone"
        value={formatInternalName.schematic(serverData?.activeSchematic) || "N/A"}
      />
      <Block
        label="satisfactory.tickrate"
        value={t("common.number", { value: serverData?.averageTickRate }) || "N/A"}
      />
    </Container>
  );
}
