import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: giteaNotifications, error: giteaNotificationsError } = useWidgetAPI(widget, "notifications");
  const { data: giteaIssues, error: giteaIssuesError } = useWidgetAPI(widget, "issues");
  const { data: giteaPulls, error: giteaPullsError } = useWidgetAPI(widget, "pulls");
  const { data: giteaRepositories, error: giteaRepositoriesError } = useWidgetAPI(widget, "repositories");

  const error = giteaNotificationsError ?? giteaIssuesError ?? giteaPullsError ?? giteaRepositoriesError;
  if (error) {
    return <Container service={service} error={error} />;
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
      <Block label="gitea.notifications" value={giteaNotifications.count} />
      <Block label="gitea.issues" value={giteaIssues.count} />
      <Block label="gitea.pulls" value={giteaPulls.count} />
      <Block label="gitea.repositories" value={giteaRepositories.count} />
    </Container>
  );
}
