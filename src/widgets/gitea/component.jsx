import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: giteaNotifications, error: giteaNotificationsError } = useWidgetAPI(widget, "notifications");
  const { data: giteaIssues, error: giteaIssuesError } = useWidgetAPI(widget, "issues");
  const { data: giteaPulls, error: giteaPullsError } = useWidgetAPI(widget, "pulls");
  const { data: giteaRepositories, error: giteaRepositoriesError } = useWidgetAPI(widget, "repositories");

  if (giteaNotificationsError || giteaIssuesError || giteaPullsError || giteaRepositoriesError) {
    return (
      <Container
        service={service}
        error={giteaNotificationsError ?? giteaIssuesError ?? giteaPullsError ?? giteaRepositoriesError}
      />
    );
  }

  if (!giteaNotifications || !giteaIssues || !giteaPulls || !giteaRepositories) {
    return (
      <Container service={service}>
        <Block label="gitea.notifications" />
        <Block label="gitea.issues" />
        <Block label="gitea.pulls" />
        <Block label="gitea.repositories" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="gitea.notifications" value={t("common.number", { value: giteaNotifications.count })} />
      <Block label="gitea.issues" value={t("common.number", { value: giteaIssues.count })} />
      <Block label="gitea.pulls" value={t("common.number", { value: giteaPulls.count })} />
      <Block label="gitea.repositories" value={t("common.number", { value: giteaRepositories.count })} />
    </Container>
  );
}
