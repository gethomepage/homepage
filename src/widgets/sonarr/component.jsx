import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: wantedData, error: wantedError } = useWidgetAPI(widget, "wanted/missing");
  const { data: queuedData, error: queuedError } = useWidgetAPI(widget, "queue");
  const { data: seriesData, error: seriesError } = useWidgetAPI(widget, "series");

  if (wantedError || wantedData?.error || queuedError || queuedData?.error || seriesError || seriesData?.error) {
    const finalError = wantedError ?? wantedData?.error ?? queuedError ?? queuedData?.error ?? seriesError ?? seriesData?.error;
    return <Container error={finalError} />;
  }

  if (!wantedData || !queuedData || !seriesData) {
    return (
      <Container service={service}>
        <Block label="sonarr.wanted" />
        <Block label="sonarr.queued" />
        <Block label="sonarr.series" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="sonarr.wanted" value={wantedData.totalRecords} />
      <Block label="sonarr.queued" value={queuedData.totalRecords} />
      <Block label="sonarr.series" value={seriesData.total} />
    </Container>
  );
}
