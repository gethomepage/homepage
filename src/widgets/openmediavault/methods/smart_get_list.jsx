// noinspection JSUnresolvedVariable

import useWidgetAPI from "utils/proxy/use-widget-api";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

const passedReduce = (acc, e) => {
  if (e.overallstatus === "GOOD") {
    return acc + 1;
  }
  return acc;
};
const failedReduce = (acc, e) => {
  if (e.overallstatus !== "GOOD") {
    return acc + 1;
  }
  return acc;
};

const items = [
  { label: "openmediavault.passed", getNumber: (data) => data.reduce(passedReduce, 0) },
  { label: "openmediavault.failed", getNumber: (data) => data.reduce(failedReduce, 0) },
];

export default function Component({ service }) {
  const { data, error } = useWidgetAPI(service.widget);

  if (error || data?.error) {
    return <Container service={service} error={error || data?.error} />;
  }

  const itemsWithData = items.map((item) => ({
    ...item,
    number: data?.response?.output ? item.getNumber(JSON.parse(data.response.output).data) : null,
  }));

  return (
    <Container service={service}>
      {itemsWithData.map((e) => (
        <Block key={e.label} label={e.label} value={e.number} />
      ))}
    </Container>
  );
}
