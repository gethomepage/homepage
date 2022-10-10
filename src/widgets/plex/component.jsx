import useSWR from "swr";
import { useTranslation } from "next-i18next";
import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { formatProxyUrl } from "utils/proxy/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: plexData, error: plexAPIError } = useSWR(formatProxyUrl(widget, "unified"), {
    refreshInterval: 5000,
  });

  if (plexAPIError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!plexData) {
    return (
      <Container service={service}>
        <Block label="plex.streams" />
        <Block label="plex.movies" />
        <Block label="plex.tv" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="plex.streams" value={t("common.number", { value: plexData.streams })} />
      <Block label="plex.movies" value={t("common.number", { value: plexData.movies })} />
      <Block label="plex.tv" value={t("common.number", { value: plexData.tv })} />
    </Container>
  );
}
