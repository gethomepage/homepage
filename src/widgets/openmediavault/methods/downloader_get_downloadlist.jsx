// noinspection JSUnresolvedVariable

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
  { label: "openmediavault.downloading", getNumber: (data) => data.reduce(downloadReduce, 0) },
  { label: "openmediavault.total", getNumber: (data) => data?.length },
];

// noinspection DuplicatedCode
export default function Component({ service }) {
  const { data, error } = useWidgetAPI(service.widget);

  if (error || data?.error) {
    return <Container service={service} error={error || data?.error} />;
  }

  const itemsWithData = items.map((item) => ({
    ...item,
    number: data?.response?.data ? item.getNumber(data.response.data) : null,
  }));

  return (
    <Container service={service}>
      {itemsWithData.map((e) => (
        <Block key={e.label} label={e.label} value={e.number} />
      ))}
    </Container>
  );
}
