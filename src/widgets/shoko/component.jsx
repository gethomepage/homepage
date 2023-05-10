import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: shokoData, error: shokoError } = useWidgetAPI(widget);

  if (shokoError) {
    return <Container service={service} error={shokoError} />;
  }

  if (!shokoData) {
    return (
      <Container service={service}>
        <Block label="shoko.series" />
        <Block label="shoko.movies" />
        <Block label="shoko.ovas" />
        <Block label="shoko.others" />
      </Container>
    );
  }

  const { Series: series, Movie: movies, OVA: ovas, ...others } = shokoData;

  return (
    <Container service={service}>
      <Block label="shoko.series" value={t("common.number", { value: series })} />
      <Block label="shoko.movies" value={t("common.number", { value: movies })} />
      <Block label="shoko.ovas" value={t("common.number", { value: ovas })} />
      <Block
        label="shoko.others"
        value={t("common.number", { value: Object.values(others).reduce((total, item) => total + item) })}
      />
    </Container>
  );
}
