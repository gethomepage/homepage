import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "stats");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="pangolin.orgs" />
        <Block label="pangolin.sites" />
        <Block label="pangolin.resources" />
        <Block label="pangolin.targets" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="pangolin.orgs" value={t("common.number", { value: data.orgs })} />
      <Block label="pangolin.sites" value={`${data.sitesOnline} / ${data.sites}`} />
      <Block label="pangolin.resources" value={`${data.resourcesHealthy} / ${data.resources}`} />
      <Block label="pangolin.targets" value={`${data.targetsHealthy} / ${data.targets}`} />
    </Container>
  );
}
