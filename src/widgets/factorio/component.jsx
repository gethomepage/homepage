import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";

import useWidgetAPI from "utils/proxy/use-widget-api";

const TICKS_PER_SECOND = 60;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data, error } = useWidgetAPI(widget, "status");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="factorio.status" />
        <Block label="factorio.players" />
        <Block label="factorio.playtime" />
      </Container>
    );
  }

  const status = data.online ? t("factorio.online") : t("factorio.offline");
  const players = data.online ? t("common.number", { value: data.players }) : "-";
  const playtime = data.online ? t("common.duration", { value: data.tick / TICKS_PER_SECOND }) : "-";

  return (
    <Container service={service}>
      <Block label="factorio.status" value={status} />
      <Block label="factorio.players" value={players} />
      <Block label="factorio.playtime" value={playtime} />
    </Container>
  );
}
