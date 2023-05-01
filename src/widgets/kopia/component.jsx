import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

function relativeDate(date) {
  const seconds = Math.abs(Math.floor((new Date() - date) / 1000));

  let interval = Math.abs(seconds / 31536000);

  if (interval > 1) {
    return `${Math.floor(interval)} y`;
  }
  interval = seconds / 2592000;
  if (interval > 1) {
    return `${Math.floor(interval)} mo`;
  }
  interval = seconds / 86400;
  if (interval > 1) {
    return `${Math.floor(interval)} d`;
  }
  interval = seconds / 3600;
  if (interval > 1) {
    return `${Math.floor(interval)} h`;
  }
  interval = seconds / 60;
  if (interval > 1) {
    return `${Math.floor(interval)} m`;
  }
  return `${Math.floor(seconds)} s`;
}

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");

  if (statusError) {
    return <Container service={service} error={statusError} />;
  }

  const source = statusData?.sources[0];

  if (!statusData || !source) {
    return (
      <Container service={service}>
        <Block label="kopia.status" />
        <Block label="kopia.size" />
        <Block label="kopia.lastrun" />
        <Block label="kopia.nextrun" />
      </Container>
    );
  }

  const lastRun = source.lastSnapshot.stats.errorCount === 0 ? new Date(source.lastSnapshot.startTime) : t("kopia.failed");
  const nextTime = source.nextSnapshotTime ? new Date(source.nextSnapshotTime) : null;

  return (
    <Container service={service}>
      <Block label="kopia.status" value={ source.status } />
      <Block label="kopia.size" value={t("common.bbytes", { value: source.lastSnapshot.stats.totalSize, maximumFractionDigits: 1 })} />
      <Block label="kopia.lastrun" value={ relativeDate(lastRun) } />
      {nextTime && <Block label="kopia.nextrun" value={ relativeDate(nextTime) } />}
    </Container>
  );
}
