import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: moviesData, error: moviesError } = useWidgetAPI(widget, "movie");
  const { data: queuedData, error: queuedError } = useWidgetAPI(widget, "queue/status");

  if (moviesError || queuedError) {
    const finalError = moviesError ?? queuedError;
    return <Container error={finalError} />;
  }

  if (!moviesData || !queuedData) {
    return (
      <Container service={service}>
        <Block label="radarr.wanted" />
        <Block label="radarr.missing" />
        <Block label="radarr.queued" />
        <Block label="radarr.movies" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="radarr.wanted" value={moviesData.wanted} />
      <Block label="radarr.missing" value={moviesData.missing} />
      <Block label="radarr.queued" value={queuedData.totalCount} />
      <Block label="radarr.movies" value={moviesData.have} />
    </Container>
  );
}
