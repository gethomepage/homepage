import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "request/count");

  if (statsError || statsData?.error) {
    const finalError = statsError ?? statsData.error;
    return <Container error={finalError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="overseerr.pending" />
        <Block label="overseerr.approved" />
        <Block label="overseerr.available" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="overseerr.pending" value={statsData.pending} />
      <Block label="overseerr.approved" value={statsData.approved} />
      <Block label="overseerr.available" value={statsData.available} />
    </Container>
  );
}
