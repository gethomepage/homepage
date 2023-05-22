import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: workersData, error: workersError } = useWidgetAPI(widget, "workers");
  const { data: pendingData, error: pendingError } = useWidgetAPI(widget, "pending");

  if (workersError || pendingError) {
    const finalError = workersError ?? pendingError;
    return <Container service={service} error={finalError} />;
  }

  if (!workersData || !pendingData) {
    return (
      <Container service={service}>
        <Block label="unmanic.active_workers" />
        <Block label="unmanic.total_workers" />
        <Block label="unmanic.records_total" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="unmanic.active_workers" value={workersData.active_workers} />
      <Block label="unmanic.total_workers" value={workersData.total_workers} />
      <Block label="unmanic.records_total" value={pendingData.recordsTotal} />
    </Container>
  );
}
