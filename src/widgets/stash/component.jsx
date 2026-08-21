import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next/pages";
import { useEffect, useState } from "react";

import { formatProxyUrl } from "utils/proxy/api-helpers";
import withWidgetFields from "utils/widget-fields";

const DEFAULT_FIELDS = ["scenes", "images"];

export default function Component({ service: configuredService }) {
  const { t } = useTranslation();

  const service = withWidgetFields(configuredService, DEFAULT_FIELDS);
  const requestWidget = configuredService.widget;
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      const url = formatProxyUrl(requestWidget, "stats");
      const res = await fetch(url, { method: "POST" });
      setStats(await res.json());
    }
    if (!stats) {
      fetchStats();
    }
  }, [requestWidget, stats]);

  if (!stats) {
    return (
      <Container service={service}>
        <Block label="stash.scenes" />
        <Block label="stash.images" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="stash.scenes" value={t("common.number", { value: stats.scene_count })} />
      <Block label="stash.scenesPlayed" value={t("common.number", { value: stats.scenes_played })} />
      <Block label="stash.playCount" value={t("common.number", { value: stats.total_play_count })} />
      <Block label="stash.playDuration" value={t("common.duration", { value: stats.total_play_duration })} />
      <Block
        label="stash.sceneSize"
        value={t("common.bbytes", { value: stats.scenes_size, maximumFractionDigits: 1 })}
      />
      <Block label="stash.sceneDuration" value={t("common.duration", { value: stats.scenes_duration })} />

      <Block label="stash.images" value={t("common.number", { value: stats.image_count })} />
      <Block
        label="stash.imageSize"
        value={t("common.bbytes", { value: stats.images_size, maximumFractionDigits: 1 })}
      />

      <Block label="stash.galleries" value={t("common.number", { value: stats.gallery_count })} />
      <Block label="stash.performers" value={t("common.number", { value: stats.performer_count })} />
      <Block label="stash.studios" value={t("common.number", { value: stats.studio_count })} />
      <Block label="stash.movies" value={t("common.number", { value: stats.movie_count })} />
      <Block label="stash.tags" value={t("common.number", { value: stats.tag_count })} />
      <Block label="stash.oCount" value={t("common.number", { value: stats.total_o_count })} />
    </Container>
  );
}
