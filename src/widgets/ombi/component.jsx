import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "Request/count");

  if (statsError) {
    return <Container error={statsError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="ombi.pending" />
        <Block label="ombi.approved" />
        <Block label="ombi.available" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="ombi.pending" value={statsData.pending} />
      <Block label="ombi.approved" value={statsData.approved} />
      <Block label="ombi.available" value={statsData.available} />
    </Container>
  );
}
