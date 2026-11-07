import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { data, error } = useWidgetAPI(service.widget, "metrics");

  if (error) {
    return <Container service={service} error={error} />;
  }

  const counts = data ?? {};
  const formatCount = (value) => (value == null ? "-" : t("common.number", { value }));

  return (
    <Container service={service}>
      <Block label="wikijs.pages" value={formatCount(counts.pages)} />
      <Block label="wikijs.users" value={formatCount(counts.users)} />
      <Block label="wikijs.groups" value={formatCount(counts.groups)} />
    </Container>
  );
}