import { useTranslation } from "next-i18next";

import determineStatuses from "./stats-helper";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: urbackupData, error: urbackupError } = useWidgetAPI(widget, "status");

  if (urbackupError) {
    return <Container service={service} error={urbackupError} />;
  }

  if (!urbackupData) {
    return (
      <Container service={service}>
        <Block label="urbackup.ok" />
        <Block label="urbackup.errored" />
        <Block label="urbackup.noRecent" />
      </Container>
    );
  }

  const statusData = determineStatuses(urbackupData, widget);

  return (
    <Container service={service}>
      <Block label="urbackup.ok" value={t("common.number", { value: parseInt(statusData.ok, 10) })} />
      <Block label="urbackup.errored" value={t("common.number", { value: parseInt(statusData.errored, 10) })} />
      <Block label="urbackup.noRecent" value={t("common.number", { value: parseInt(statusData.noRecent, 10) })} />
      {urbackupData.diskUsage && <Block label="urbackup.totalUsed" value={t("common.bbytes", {value: parseFloat(statusData.totalUsage, 10)})} />}
    </Container>
  );
}
