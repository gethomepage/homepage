import { useTranslation } from "next-i18next";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";




export default function Component ({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: notifications, error: giteaError } = useWidgetAPI(widget, "allNotifications");
  const notificationTypes = (notifications ?? []).reduce((acc, notification) => {
      acc[notification.subject.type].push(notification);
      return acc;
    }
    , {
      "Issue": [],
      "Pull": [],
      "Commit": [],
      "Repository": []
    }
  );

  if (giteaError) {
    return <Container service={service} error={giteaError} />;
  }

  if (!notifications) return (
    <Container service={service}>
      <Block label="gitea.notifications" />
    </Container>
  );

  return (
    <Container service={service}>
      {Object.keys(notificationTypes).map((type) =>
        <Block key={type} label={`gitea.${type}`}
               value={t("common.number", { value: notificationTypes[type].length })} />
      )}
    </Container>
  );
}
