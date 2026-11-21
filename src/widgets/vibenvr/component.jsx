import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { data, error } = useWidgetAPI(service.widget, "health");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="vibenvr.status" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="vibenvr.status" value={data.status} />
      <Block label="vibenvr.database" value={data.components?.database} />
      <Block label="vibenvr.engine" value={data.components?.engine} />
    </Container>
  );
}
