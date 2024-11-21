import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: librariesData, error: librariesError } = useWidgetAPI(widget, "libraries");

  if (librariesError) {
    return <Container service={service} error={librariesError} />;
  }

  if (!librariesData) {
    return (
      <Container service={service}>
        <Block label="audiobookshelf.podcasts" />
        <Block label="audiobookshelf.podcastsDuration" />
        <Block label="audiobookshelf.books" />
        <Block label="audiobookshelf.booksDuration" />
      </Container>
    );
  }

  const podcastLibraries = librariesData.filter((l) => l.mediaType === "podcast");
  const bookLibraries = librariesData.filter((l) => l.mediaType === "book");

  const totalPodcasts = podcastLibraries.reduce((total, pL) => parseInt(pL.stats?.totalItems, 10) + total, 0);
  const totalBooks = bookLibraries.reduce((total, bL) => parseInt(bL.stats?.totalItems, 10) + total, 0);

  const totalPodcastsDuration = podcastLibraries.reduce((total, pL) => parseFloat(pL.stats?.totalDuration) + total, 0);
  const totalBooksDuration = bookLibraries.reduce((total, bL) => parseFloat(bL.stats?.totalDuration) + total, 0);

  return (
    <Container service={service}>
      <Block label="audiobookshelf.podcasts" value={t("common.number", { value: totalPodcasts })} />
      <Block
        label="audiobookshelf.podcastsDuration"
        value={t("common.duration", {
          value: totalPodcastsDuration,
        })}
      />
      <Block label="audiobookshelf.books" value={t("common.number", { value: totalBooks })} />
      <Block
        label="audiobookshelf.booksDuration"
        value={t("common.duration", {
          value: totalBooksDuration,
        })}
      />
    </Container>
  );
}
