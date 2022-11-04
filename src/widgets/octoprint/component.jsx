import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: jobData, error: jobError } = useWidgetAPI(widget, "job");
  // const { data: wantedData, error: wantedError } = useWidgetAPI(widget, "wanted/missing");
  // const { data: queueData, error: queueError } = useWidgetAPI(widget, "queue/status");

  if (jobError) {
    return <Container error={t("widget.api_error")} />;
  }

  if (!jobData) {
    return (
      <Container service={service}>
        <Block label="octoprint.job_status" />
        <Block label="octoprint.file_name" />
        <Block label="octoprint.progress" />
      </Container>
    );
  }

  const progress = jobData.progress.completion
  if (progress !== null) {
    var progress_pct = jobData.progress.completion.toFixed(2) + " %"
  } else {
    var progress_pct = "-"
  }

  return (
    <Container service={service}>
      <Block label="octoprint.job_status" value={ jobData.state } />
      <Block label="octoprint.file_name" value={ jobData.job.file.name } />
      <Block label="octoprint.job_progress" value={ progress_pct } />
    </Container>
  );
}
