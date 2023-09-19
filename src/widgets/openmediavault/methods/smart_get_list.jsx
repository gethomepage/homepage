import useWidgetAPI from "utils/proxy/use-widget-api";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

const passedReduce = (acc, e) => {
  if (e.monitor && e.overallstatus === "GOOD") {
    return acc + 1;
  }
  return acc;
};
const failedReduce = (acc, e) => {
  if (e.monitor && e.overallstatus !== "GOOD") {
    return acc + 1;
  }
  return acc;
};

const items = [
  { label: "openmediavault.passed", getNumber: (data) => (!data ? null : data.reduce(passedReduce, 0)) },
  { label: "openmediavault.failed", getNumber: (data) => (!data ? null : data.reduce(failedReduce, 0)) },
];

export default function Component({ service }) {
  const { data, error } = useWidgetAPI(service.widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  const itemsWithData = items.map((item) => ({
    ...item,
    number: item.getNumber(JSON.parse(data?.response?.output || "{}")?.data),
  }));

  return (
    <Container service={service}>
      {itemsWithData.map((e) => (
        <Block key={e.label} label={e.label} value={e.number} />
      ))}
    </Container>
  );
}
