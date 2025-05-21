import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: giteaNotifications, error: giteaNotificationsError } = useWidgetAPI(widget, "notifications");
  const { data: giteaIssues, error: giteaIssuesError } = useWidgetAPI(widget, "issues");
  const { data: giteaRepositories, error: giteaRepositoriesError } = useWidgetAPI(widget, "repositories");

  if (giteaNotificationsError || giteaIssuesError || giteaRepositoriesError) {
    return (
      <Container service={service} error={giteaNotificationsError ?? giteaIssuesError ?? giteaRepositoriesError} />
    );
  }

  if (!giteaNotifications || !giteaIssues || !giteaRepositories) {
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
      <Block label="gitea.notifications" value={giteaNotifications.length} />
      <Block label="gitea.issues" value={giteaIssues.issues.length} />
      <Block label="gitea.pulls" value={giteaIssues.pulls.length} />
      <Block label="gitea.repositories" value={giteaRepositories.data.length} />
    </Container>
  );
}
