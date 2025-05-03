import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  // Days validation
  if (!(Number.isInteger(widget.days) && 0 < widget.days)) widget.days = 30;

  const { data: viewsData, error: viewsError } = useWidgetAPI(widget, "getViewsByLibraryType", { days: widget.days });

  const error = viewsError || viewsData?.message;
  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!viewsData) {
    return (
      <Container service={service}>
        <Block label="jellystat.songs" />
        <Block label="jellystat.movies" />
        <Block label="jellystat.episodes" />
        <Block label="jellystat.other" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="jellystat.songs" value={viewsData.Audio} />
      <Block label="jellystat.movies" value={viewsData.Movie} />
      <Block label="jellystat.episodes" value={viewsData.Series} />
      <Block label="jellystat.other" value={viewsData.Other} />
    </Container>
  );
}
