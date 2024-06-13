import { useTranslation } from "next-i18next";
import { useEffect, useState } from "react";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const [stats, setStats] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      const url = formatProxyUrl(widget, "stats");
      const res = await fetch(url, { method: "POST" });
      setStats(await res.json());
    }
    if (!stats) {
      fetchStats();
    }
  }, [widget, stats]);

  if (!stats) {
    return (
      <Container service={service}>
        <Block label="stash.scenes" />
        <Block label="stash.images" />
      </Container>
    );
  }

  // Provide a default if not set in the config
  if (!widget.fields) {
    widget.fields = ["scenes", "images"];
  }

  // Limit to a maximum of 4 at a time
  if (widget.fields.length > 4) {
    widget.fields = widget.fields.slice(0, 4);
  }

  return (
    <Container service={service}>
      <Block label="stash.scenes" value={t("common.number", { value: stats.scene_count })} />
      <Block label="stash.scenesPlayed" value={t("common.number", { value: stats.scenes_played })} />
      <Block label="stash.playCount" value={t("common.number", { value: stats.total_play_count })} />
      <Block label="stash.playDuration" value={t("common.uptime", { value: stats.total_play_duration })} />
      <Block
        label="stash.sceneSize"
        value={t("common.bbytes", { value: stats.scenes_size, maximumFractionDigits: 1 })}
      />
      <Block label="stash.sceneDuration" value={t("common.uptime", { value: stats.scenes_duration })} />

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
