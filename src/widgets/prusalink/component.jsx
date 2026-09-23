import { useTranslation } from "next-i18next/pages";

import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation("common");
  const { data, error } = useWidgetAPI(service.widget, "status");

  if (error) return <Container service={service} error={error} />;

  if (!data) {
    return (
      <Container service={service}>
        <Block label="prusalink.state" />
        <Block label="prusalink.progress" />
        <Block label="prusalink.time_left" />
      </Container>
    );
  }

  const { printer = {}, job } = data;

  return (
    <Container service={service}>
      <Block label="prusalink.state" value={printer.state ?? "-"} />
      <Block
        label="prusalink.progress"
        value={job?.progress == null ? "-" : t("common.percent", { value: job.progress })}
        highlightValue={job?.progress}
      />
      <Block
        label="prusalink.time_left"
        value={job?.time_remaining == null ? "-" : t("common.duration", { value: job.time_remaining })}
        highlightValue={job?.time_remaining}
      />
    </Container>
  );
}
