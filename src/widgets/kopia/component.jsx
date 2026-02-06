import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import { useTranslation } from "next-i18next";

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

  const snapshotHost = service.widget?.snapshotHost;
  const snapshotPath = service.widget?.snapshotPath;

  const sources = statusData?.sources
    .filter((el) => (snapshotHost ? el.source.host === snapshotHost : true))
    .filter((el) => (snapshotPath ? el.source.path === snapshotPath : true));

  if (!statusData || !sources?.length) {
    return (
      <Container service={service}>
        <Block label="kopia.status" />
        <Block label="kopia.size" />
        <Block label="kopia.lastrun" />
        <Block label="kopia.nextrun" />
      </Container>
    );
  }

  const totalSize = sources.reduce((sum, s) => sum + s.lastSnapshot.stats.totalSize, 0);

  const successfulSources = sources.filter((s) => s.lastSnapshot.stats.errorCount === 0);
  const lastRun =
    successfulSources.length > 0
      ? new Date(Math.max(...successfulSources.map((s) => new Date(s.lastSnapshot.startTime).getTime())))
      : t("kopia.failed");

  const nextTimes = sources.map((s) => s.nextSnapshotTime).filter(Boolean);
  const nextTime = nextTimes.length > 0 ? new Date(Math.min(...nextTimes.map((t) => new Date(t).getTime()))) : null;

  return (
    <Container service={service}>
      <Block label="kopia.status" value={sources.length === 1 ? sources[0].status : `${sources.length} sources`} />
      <Block label="kopia.size" value={t("common.bbytes", { value: totalSize, maximumFractionDigits: 1 })} />
      <Block label="kopia.lastrun" value={typeof lastRun === "string" ? lastRun : relativeDate(lastRun)} />
      {nextTime && <Block label="kopia.nextrun" value={relativeDate(nextTime)} />}
    </Container>
  );
}
