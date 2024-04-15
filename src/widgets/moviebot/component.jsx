import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: listTVResult } = useWidgetAPI(widget, "SubscribeList", {
    refreshInterval: 60000,
    media_type: "TV",
  });
  const { data: listMovieResult } = useWidgetAPI(widget, "SubscribeList", {
    refreshInterval: 60000,
    media_type: "Movie",
  });

  const result = useWidgetAPI(widget, "GetSites", {
    refreshInterval: 60000,
  });
  const sites = result.data?.data || [];

  const SitesOverview = useWidgetAPI(widget, "SitesOverview", {
    refreshInterval: 60000,
  });

  const subingTVList = listTVResult?.data.filter((item) => item.status === 0) || 0;
  const subingMovieList = listMovieResult?.data.filter((item) => item.status === 0) || 0;

  const todayUp = SitesOverview.data?.data?.today_up || 0;
  const todayDl = SitesOverview.data?.data?.today_dl || 0;
  const normalSites = sites.filter((s) => s.status === 1).length || 0;
  const errorSites = sites.filter((s) => s.status === 0).length || 0;

  return (
    <Container service={service}>
      <Block label="moviebot.subscribe" value={subingTVList.length + subingMovieList.length} />
      <Block label="moviebot.sites" value={errorSites ? `异常 ${errorSites} 个` : `可用 ${normalSites} 个`} />

      <Block
        label="moviebot.todayUp"
        value={`${todayUp > 1000 ? `${(todayUp / 1000).toFixed(2)} GB` : `${Math.floor(todayUp)} MB`}`}
      />
      <Block
        label="moviebot.todayDl"
        value={`${todayDl > 1000 ? `${(todayDl / 1000).toFixed(2)} GB` : `${Math.floor(todayDl)} MB`}`}
      />
    </Container>
  );
}
