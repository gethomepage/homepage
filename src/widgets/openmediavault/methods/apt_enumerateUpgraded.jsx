// noinspection JSUnresolvedVariable

import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";
import Container from "components/services/widget/container";
import Block from "components/services/widget/block";

const items = [
  {
    label: "openmediavault.updatesAvailable",
    getValue: (data, t) => (data.length > 0 ? t("openmediavault.yes") : t("openmediavault.no")),
  },
];

// noinspection DuplicatedCode
export default function Component({ service }) {
  const { t } = useTranslation();
  const { data, error } = useWidgetAPI(service.widget);

  if (error) {
    return <Container service={service} error={error} />;
  }

  const itemsWithData = items.map((item) => ({
    ...item,
    number: data?.response ? item.getValue(data.response, t) : null,
  }));

  return (
    <Container service={service}>
      {itemsWithData.map((e) => (
        <Block key={e.label} label={e.label} value={e.number} />
      ))}
    </Container>
  );
}
