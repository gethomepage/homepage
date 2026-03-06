import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "tree");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="leafwiki.pages" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="leafwiki.pages" value={t("common.number", { value: data.pages })} />
    </Container>
  );
}
