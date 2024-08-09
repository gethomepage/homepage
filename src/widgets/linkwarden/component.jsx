import React, { useState, useEffect } from "react";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const [stats, setStats] = useState({
    totalLinks: null,
    collections: { total: null },
    tags: { total: null },
  });

  const { data: collectionsStatsData, error: collectionsStatsError } = useWidgetAPI(widget, "collections");
  const { data: tagsStatsData, error: tagsStatsError } = useWidgetAPI(widget, "tags");

  useEffect(() => {
    if (collectionsStatsData?.response && tagsStatsData?.response) {
      setStats({
        // eslint-disable-next-line no-underscore-dangle
        totalLinks: collectionsStatsData.response.reduce((sum, collection) => sum + (collection._count?.links || 0), 0),
        collections: {
          total: collectionsStatsData.response.length,
        },
        tags: {
          total: tagsStatsData.response.length,
        },
      });
    }
  }, [collectionsStatsData, tagsStatsData]);

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
      <Block label="linkwarden.links" value={stats.totalLinks} />
      <Block label="linkwarden.collections" value={stats.collections.total} />
      <Block label="linkwarden.tags" value={stats.tags.total} />
    </Container>
  );
}
