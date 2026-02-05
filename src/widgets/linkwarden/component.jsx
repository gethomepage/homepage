import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: collectionsStatsData, error: collectionsStatsError } = useWidgetAPI(widget, "collections");
  const { data: tagsStatsData, error: tagsStatsError } = useWidgetAPI(widget, "tags");

  // Some APIs return raw arrays, others wrap the payload (e.g. { response: [...] }).
  const collections = collectionsStatsData?.response ?? collectionsStatsData;
  const tags = tagsStatsData?.response ?? tagsStatsData;

  const totalLinks = Array.isArray(collections)
    ? collections.reduce((sum, collection) => sum + (collection._count?.links || 0), 0)
    : null;
  const collectionsTotal = Array.isArray(collections) ? collections.length : null;
  const tagsTotal = Array.isArray(tags) ? tags.length : null;

  if (collectionsStatsError || tagsStatsError) {
    return <Container service={service} error={collectionsStatsError || tagsStatsError} />;
  }

  if (!tagsStatsData || !collectionsStatsData) {
    return (
      <Container service={service}>
        <Block label="linkwarden.links" />
        <Block label="linkwarden.collections" />
        <Block label="linkwarden.tags" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="linkwarden.links" value={totalLinks} />
      <Block label="linkwarden.collections" value={collectionsTotal} />
      <Block label="linkwarden.tags" value={tagsTotal} />
    </Container>
  );
}
