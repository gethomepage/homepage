import useSWR from "swr";
import { useTranslation } from "next-i18next";

import Widget from "components/services/widgets/widget";
import Block from "components/services/widgets/block";
import { formatProxyUrl } from "utils/api-helpers";

export default function Component({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: statsData, error: statsError } = useSWR(formatProxyUrl(config, `request/count`));

  if (statsError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!statsData) {
    return (
      <Widget>
        <Block label={t("jellyseerr.pending")} />
        <Block label={t("jellyseerr.approved")} />
        <Block label={t("jellyseerr.available")} />
      </Widget>
    );
  }

  return (
    <Widget>
      <Block label={t("jellyseerr.pending")} value={statsData.pending} />
      <Block label={t("jellyseerr.approved")} value={statsData.approved} />
      <Block label={t("jellyseerr.available")} value={statsData.available} />
    </Widget>
  );
}
