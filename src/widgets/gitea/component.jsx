import { useTranslation } from "next-i18next";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";


function hasField(fields, fieldTypes) {
  return fields.some(field => fieldTypes.includes(field));
}

export default function Component({ service }) {
  const { t } = useTranslation();
  let data = {};

  const { widget } = service;
  const fields = widget.fields ?? ["repos", "followers", "notifications"];

  // Different fields require different API calls
  const notificationFields = ["notifications", "issue", "pull", "commit", "repository"];
  const userFields = ["followers", "following"];
  const repoFields = ["repos", "stars", "forks"];

  if (hasField(fields, userFields)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: user, error: userError } = useWidgetAPI(widget, "user");
    if (userError) {
      return <Container service={service} error={userError} />;
    }
    data = { ...data, followers: user?.followers_count, following: user?.following_count };

  }

  if (hasField(fields, repoFields)) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: repos, error: repoError } = useWidgetAPI(widget, "repos");
    if (repoError) {
      return <Container service={service} error={repoError} />;
    }
    const repoStats = (repos ?? []).reduce((acc, repo) => {
      acc.repos += 1;
      acc.stars += repo.stars_count;
      acc.forks += repo.forks_count;
      return acc;
    }, { repos: 0, stars: 0, forks: 0 });

    data = { ...data, ...repoStats };
  }

  if (hasField(fields, notificationFields)) {

    // eslint-disable-next-line react-hooks/rules-of-hooks
    const { data: notifications, error: notificationError } = useWidgetAPI(widget, "notifications");

    if (notificationError) {
      return <Container service={service} error={notificationError} />;
    }

    const notificationTypes = (notifications ?? []).reduce((acc, notification) => {
        acc[notification.subject.type.toLowerCase()] += 1;
        acc.notifications += 1;
        return acc;
      }, {
        "notifications": 0, "issue": 0, "pull": 0, "commit": 0, "repository": 0
      }
    );

    data = { ...data, ...notificationTypes };
  }

  return (
    <Container service={service}>
      {fields.map((field) =>
        <Block key={field} label={`gitea.${field}`} value={data[field] ? t("common.number", { value: data[field] }) : '-'} />
      )}
    </Container>
  );
}
