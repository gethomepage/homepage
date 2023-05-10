import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: giteaData, error: giteaError } = useWidgetAPI(widget);

  if (giteaError) {
    return <Container service={service} error={giteaError} />;
  }

  if (!giteaData) {
    return (
      <Container service={service}>
        <Block label="gitea.repos" />
        <Block label="gitea.users" />
        <Block label="gitea.orgs" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="gitea.repos" value={t("common.number", { value: giteaData.repos })} />
      <Block label="gitea.users" value={t("common.number", { value: giteaData.users })} />
      <Block label="gitea.orgs" value={t("common.number", { value: giteaData.orgs })} />
    </Container>
  );
}
