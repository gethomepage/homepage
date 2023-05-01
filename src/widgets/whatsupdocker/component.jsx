import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: containersData, error: containersError } = useWidgetAPI(widget, "containers");
  
  if (containersError) {
    return <Container service={service} error={containersError} />;
  }

  if (!containersData) {
    return (
      <Container service={service}>
        <Block label="whatsupdocker.monitoring" />
        <Block label="whatsupdocker.updates" />
      </Container>
    );
  }

  const totalCount = containersData.length;
  const updatesAvailable = containersData.filter(container => container.updateAvailable).length;

  return (
    <Container service={service}>
      <Block label="whatsupdocker.monitoring" value={totalCount} />
      <Block label="whatsupdocker.updates" value={updatesAvailable} />
    </Container>
  );
}
