import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "", { refreshInterval: 60000 });
  if (error) {
    return <Container error={error} />;
  }
  const panels = [];
  data?.forEach(d => panels.push(<Block label={d.label} value={d.value} />));

  return <Container service={service}>{panels}</Container>;
}
