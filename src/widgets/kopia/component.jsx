import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;
  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");
  const { data: tasksData, error: tasksError } = useWidgetAPI(widget, "tasks");

  if (statusError || tasksError) {
    return <Container error={statusError ?? tasksError} />;
  }

  if (!statusData || !tasksData) {
    return (
      <Container service={service}>
        <Block label="kopia.status" />
        <Block label="kopia.size" />
        <Block label="kopia.lastrun" />
        <Block label="kopia.nextrun" />
      </Container>
    );
  }

  function fromTasks(task) {
    for (let i=0; i<task.length; i += 1) {
      const taskKind = task[i].kind;
      if ( taskKind === "Snapshot") {
        const taskStatus = task[i].status;
        return taskStatus;
      }
    }
    return 0;
  }

  const nowTime = new Date();
  const nextTime = new Date(statusData.sources[0].nextSnapshotTime);
  const leftTime = new Date(nextTime - nowTime);
  const hours = leftTime.getUTCHours().toString().padStart(2, '0');
  const minutes = leftTime.getUTCMinutes().toString().padStart(2, '0');
  const h = "h ";
  const m = "m";
  const time = (hours + h + minutes + m);

  return (
    <Container service={service}>
      <Block label="kopia.status" value={ statusData.sources[0].status } />
      <Block label="kopia.size" value={t("common.bbytes", { value: statusData.sources[0].lastSnapshot.stats.totalSize, maximumFractionDigits: 1 })} />
      <Block label="kopia.lastrun" value={ fromTasks(tasksData.tasks) } />
      <Block label="kopia.nextrun" value={ time } />
    </Container>
  );
}