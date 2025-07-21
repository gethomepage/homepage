import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: forgejoNotifications, error: forgejoNotificationsError } = useWidgetAPI(widget, "notifications");
  const { data: forgejoIssues, error: forgejoIssuesError } = useWidgetAPI(widget, "issues");
  const { data: forgejoRepositories, error: forgejoRepositoriesError } = useWidgetAPI(widget, "repositories");

  if (forgejoNotificationsError || forgejoIssuesError || forgejoRepositoriesError) {
    return (
      <Container service={service} error={forgejoNotificationsError ?? forgejoIssuesError ?? forgejoRepositoriesError} />
    );
  }

  if (!forgejoNotifications || !forgejoIssues || !forgejoRepositories) {
    return (
      <Container service={service}>
        <Block label="forgejo.notifications" />
        <Block label="forgejo.issues" />
        <Block label="forgejo.pulls" />
        <Block label="forgejo.repositories" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="forgejo.notifications" value={forgejoNotifications.length} />
      <Block label="forgejo.issues" value={forgejoIssues.issues.length} />
      <Block label="forgejo.pulls" value={forgejoIssues.pulls.length} />
      <Block label="forgejo.repositories" value={forgejoRepositories.data.length} />
    </Container>
  );
}
