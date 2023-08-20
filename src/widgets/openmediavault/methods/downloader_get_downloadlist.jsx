import useWidgetAPI from "utils/proxy/use-widget-api";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

const downloadReduce = (acc, e) => {
  if (e.downloading) {
    return acc + 1;
  }
  return acc;
};

const items = [
  { label: "openmediavault.downloading", getNumber: (data) => (!data ? null : data.reduce(downloadReduce, 0)) },
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
