import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: statisticsData, error: statisticsError } = useWidgetAPI(widget, "statistics");

  if (statisticsError) {
    return <Container service={service} error={statisticsError} />;
  }

  if (!statisticsData) {
    return (
      <Container service={service}>
        <Block label="paperlessngx.inbox" />
        <Block label="paperlessngx.total" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      {statisticsData.documents_inbox !== undefined && <Block label="paperlessngx.inbox" value={statisticsData.documents_inbox} />}
      <Block label="paperlessngx.total" value={statisticsData.documents_total} />
    </Container>
  );
}
