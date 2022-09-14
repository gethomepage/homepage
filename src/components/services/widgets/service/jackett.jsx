import useSWR from "swr";
import { useTranslation } from "react-i18next";

import Widget from "../widget";
import Block from "../block";

import { formatApiUrl } from "utils/api-helpers";

export default function Jackett({ service }) {
  const { t } = useTranslation();

  const config = service.widget;

  const { data: indexersData, error: indexersError } = useSWR(formatApiUrl(config, "indexers"));

  if (indexersError) {
    return <Widget error={t("widget.api_error")} />;
  }

  if (!indexersData) {
    return (
      <Widget>
        <Block label={t("jackett.configured")} />
        <Block label={t("jackett.errored")} />
      </Widget>
    );
  }

  const errored = indexersData.filter((indexer) => indexer.last_error);

  return (
    <Widget>
      <Block label={t("jackett.configured")} value={indexersData.length} />
      <Block label={t("jackett.errored")} value={errored.length} />
    </Widget>
  );
}
