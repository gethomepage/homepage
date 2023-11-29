import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "info");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="changedetectionio.diffsDetected" />
        <Block label="changedetectionio.totalObserved" />
      </Container>
    );
  }

  const totalObserved = Object.keys(data).length;
  let diffsDetected = 0;

  Object.keys(data).forEach((key) => {
    if (data[key].last_changed > 0 && data[key].last_checked === data[key].last_changed && !data[key].viewed) {
      diffsDetected += 1;
    }
  });

  return (
    <Container service={service}>
      <Block label="changedetectionio.diffsDetected" value={t("common.number", { value: diffsDetected })} />
      <Block label="changedetectionio.totalObserved" value={t("common.number", { value: totalObserved })} />
    </Container>
  );
}
