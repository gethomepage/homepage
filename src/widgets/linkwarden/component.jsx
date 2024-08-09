import React, { useState, useEffect } from "react";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  // State to hold Stats
  const [stats, setStats] = useState({
    totalLinks: null,
    collections: { total: null },
    tags: { total: null },
  });

  const { data: collectionsStatsData, error: collectionsStatsError } = useWidgetAPI(widget, "collections"); // Fetch Collection Stats
  const { data: tagsStatsData, error: tagsStatsError } = useWidgetAPI(widget, "tags"); // Fetch Tag Stats

  // Effect to update Stats when collectionsStatsData or tagsStatsData changes
  useEffect(() => {
    if (collectionsStatsData?.response && tagsStatsData?.response) {
      /* eslint-disable no-underscore-dangle */
      setStats({
        totalLinks: collectionsStatsData.response.reduce((sum, collection) => sum + (collection._count?.links || 0), 0),
        collections: {
          total: collectionsStatsData.response.length,
        },
        tags: {
          total: tagsStatsData.response.length,
        },
      });
      /* eslint-enable no-underscore-dangle */
    }
  }, [collectionsStatsData, tagsStatsData]);

  if (collectionsStatsError || tagsStatsError) {
    return <Container service={service} error={collectionsStatsError || tagsStatsError} />;
  }

  // Render when data is available
  return (
    <Container service={service}>
      <Block label="linkwarden.links" value={stats.totalLinks} />
      <Block label="linkwarden.collections" value={stats.collections.total} />
      <Block label="linkwarden.tags" value={stats.tags.total} />
    </Container>
  );
}
