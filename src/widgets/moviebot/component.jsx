import { useTranslation } from "next-i18next";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: listTVResult } = useWidgetAPI(widget, "SubscribeList", {
    refreshInterval: 60000,
    media_type: "TV",
  });
  const { data: listMovieResult } = useWidgetAPI(widget, "SubscribeList", {
    refreshInterval: 60000,
    media_type: "Movie",
  });

  let subingTVList = [];
  let subingMovieList = [];
  if (listTVResult && listMovieResult) {
    subingTVList = listTVResult.data.filter((item) => item.status === 0);
    subingMovieList = listMovieResult.data.filter((item) => item.status === 0);
  }

  const result = useWidgetAPI(widget, "GetSites", {
    refreshInterval: 60000,
  });
  const sites = result.data?.data || [];

  return (
    <Container service={service}>
      <Block label="moviebot.tv" value={t("common.number", { value: subingTVList.length })} />
      <Block label="moviebot.movie" value={t("common.number", { value: subingMovieList.length })} />
      <Block label="moviebot.sites" value={t("common.number", { value: sites.filter((s) => s.status === 1).length })} />
      <Block
        label="moviebot.errorSites"
        value={t("common.number", { value: sites.filter((s) => s.status === 0).length })}
      />
    </Container>
  );
}
