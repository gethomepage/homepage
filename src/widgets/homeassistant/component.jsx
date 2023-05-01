import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, null, { refreshInterval: 60000 });
  if (error) {
    return <Container service={service} error={error} />;
  }
  
  return <Container service={service}>
    {data?.map(d => <Block label={d.label} value={d.value} key={d.label} />)}
  </Container>;
}
