import { useTranslation } from 'react-i18next';

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

const ROMM_DEFAULT_FIELDS = ["volumes", "issues", "monitored"];
const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  const { data: stats, error: statsError } = useWidgetAPI(widget);

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!widget.fields?.length > 0) {
    widget.fields = ROMM_DEFAULT_FIELDS;
  } else if (widget.fields.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  if (!stats || stats.error || statsError || !stats.result) {
    return (
      <Container service={service}>
        <Block label="kapowarr.volumes" />
        <Block label="kapowarr.issues" />
        <Block label="kapowarr.monitored" />
        <Block label="kapowarr.downloaded_issues" />
        <Block label="kapowarr.total_file_size" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="kapowarr.volumes" value={stats.result.volumes} />
      <Block label="kapowarr.issues" value={stats.result.issues} />
      <Block label="kapowarr.monitored" value={stats.result.monitored} />
      <Block label="kapowarr.downloaded_issues" value={stats.result.downloaded_issues} />
      <Block label="kapowarr.total_file_size" value={t("common.bytes", { value: stats.result.total_file_size })} />
    </Container>
  );
}
