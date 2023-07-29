import { useTranslation } from "next-i18next";

import determineStatuses from "./stats-helper";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function determineFields(widget){

  // don't include diskUsage by default, since it requires a second API call
  if (!widget.fields) return [true, true, true, false]

  return [
    widget.fields?.includes('ok'),
    widget.fields?.includes('errored'),
    widget.fields?.includes('noRecent'),
    widget.fields?.includes('totalUsed')
  ];
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: urbackupData, error: urbackupError } = useWidgetAPI(widget, "status");

  const [showOk, showErrored, showNoRecent, showDiskUsage] = determineFields(widget);

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
      {showOk && <Block label="urbackup.ok" value={t("common.number", { value: parseInt(statusData.ok, 10) })} />}
      {showErrored && <Block label="urbackup.errored" value={t("common.number", { value: parseInt(statusData.errored, 10) })} />}
      {showNoRecent && <Block label="urbackup.noRecent" value={t("common.number", { value: parseInt(statusData.noRecent, 10) })} />}
      {showDiskUsage && <Block label="urbackup.totalUsed" value={t("common.bbytes", {value: parseFloat(statusData.totalUsage, 10)})} />}
    </Container>
  );
}
