import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: forgejoNotifications, error: forgejoNotificationsError } = useWidgetAPI(widget, "notifications");
  const { data: forgejoIssues, error: forgejoIssuesError } = useWidgetAPI(widget, "issues");
  const { data: forgejoRepositories, error: forgejoRepositoriesError } = useWidgetAPI(widget, "repositories");
  const { data: forgejoCommits, error: forgejoCommitsError } = useWidgetAPI(widget, "commits");

  if (forgejoNotificationsError || forgejoIssuesError || forgejoRepositoriesError || forgejoCommitsError) {
    return (
      <Container service={service} error={forgejoNotificationsError ?? forgejoIssuesError ?? forgejoRepositoriesError ?? forgejoCommitsError} />
    );
  }

  if (!forgejoNotifications || !forgejoIssues || !forgejoRepositories || !forgejoCommits) {
    return (
      <Container service={service}>
        <Block label="forgejo.notifications" />
        <Block label="forgejo.open_issues" />
        <Block label="forgejo.repositories" />
        <Block label="forgejo.commits" />
      </Container>
    );
  }

  const openIssuesAndPulls = forgejoIssues.issues.length + forgejoIssues.pulls.length;

  return (
    <Container service={service}>
      <Block label="forgejo.notifications" value={forgejoNotifications.length} />
      <Block label="forgejo.open_issues" value={openIssuesAndPulls} />
      <Block label="forgejo.repositories" value={forgejoRepositories.data.length} />
      <Block label="forgejo.commits" value={forgejoCommits.total_commits} />
    </Container>
  );
}
