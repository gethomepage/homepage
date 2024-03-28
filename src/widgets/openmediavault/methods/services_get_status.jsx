import useWidgetAPI from "utils/proxy/use-widget-api";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

const isRunningReduce = (acc, e) => {
  if (e.running) {
    return acc + 1;
  }
  return acc;
};
const notRunningReduce = (acc, e) => {
  if (!e.running) {
    return acc + 1;
  }
  return acc;
};

const items = [
  { label: "openmediavault.running", getNumber: (data) => (!data ? null : data.reduce(isRunningReduce, 0)) },
  { label: "openmediavault.stopped", getNumber: (data) => (!data ? null : data.reduce(notRunningReduce, 0)) },
  { label: "openmediavault.total", getNumber: (data) => (!data ? null : data?.length) },
];

export default function Component({ service }) {
  const { data, error } = useWidgetAPI(service.widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  const itemsWithData = items.map((item) => ({
    ...item,
    number: item.getNumber(data?.response?.data),
  }));

  return (
    <Container service={service}>
      {itemsWithData.map((e) => (
        <Block key={e.label} label={e.label} value={e.number} />
      ))}
    </Container>
  );
}
