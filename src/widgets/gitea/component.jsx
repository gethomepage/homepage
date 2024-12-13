import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: giteaNotifications, error: giteaNotificationsError } = useWidgetAPI(widget, "notifications");
  const { data: giteaIssues, error: giteaIssuesError } = useWidgetAPI(widget, "issues");

  if (giteaNotificationsError || giteaIssuesError) {
    return <Container service={service} error={giteaNotificationsError ?? giteaIssuesError} />;
  }

  if (!giteaNotifications || !giteaIssues) {
    return (
      <Container service={service}>
        <Block label="gitea.notifications" />
        <Block label="gitea.issues" />
        <Block label="gitea.pulls" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="gitea.notifications" value={giteaNotifications.length} />
      <Block label="gitea.issues" value={giteaIssues.issues.length} />
      <Block label="gitea.pulls" value={giteaIssues.pulls.length} />
    </Container>
  );
}
