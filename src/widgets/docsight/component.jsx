import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { data: docsightData, error: docsightError } = useWidgetAPI(widget, "health");

  if (docsightError) {
    return <Container service={service} error={docsightError} />;
  }

  if (!docsightData) {
    return (
      <Container service={service}>
        <Block label="docsight.docsis_health" />
        <Block label="docsight.status" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="docsight.docsis_health" value={docsightData.docsis_health} />
      <Block label="docsight.status" value={docsightData.status} />
    </Container>
  );
}
