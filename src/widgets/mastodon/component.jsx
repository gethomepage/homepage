import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Widget from "components/services/widgets/widget";
import Block from "components/services/widgets/block";
import { formatProxyUrl } from "utils/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: statsData, error: statsError } = useSWR(formatProxyUrl(config, `instance`));

  if (statsError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!statsData) {
    return (
      <Widget>
        <Block label={t("mastodon.user_count")} />
        <Block label={t("mastodon.status_count")} />
        <Block label={t("mastodon.domain_count")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("mastodon.user_count")} value={t("common.number", { value: statsData.stats.user_count })} />
      <Block label={t("mastodon.status_count")} value={t("common.number", { value: statsData.stats.status_count })} />
      <Block label={t("mastodon.domain_count")} value={t("common.number", { value: statsData.stats.domain_count })} />
    </Widget>
  );
}
