import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { t } = useTranslation();

  const { widget } = service;

  const { data: datastoreData, error: datastoreError } = useWidgetAPI(widget, "status/datastore-usage");
  const { data: tasksData, error: tasksError } = useWidgetAPI(widget, "nodes/localhost/tasks");
  const { data: hostData, error: hostError } = useWidgetAPI(widget, "nodes/localhost/status");

  if (datastoreError || tasksError || hostError) {
    const finalError = tasksError ?? datastoreError ?? hostError;
    return <Container service={service} error={finalError} />;
  }

  if (!datastoreData || !tasksData || !hostData) {
    return (
      <Container service={service}>
        <Block label="proxmoxbackupserver.datastore_usage" />
        <Block label="proxmoxbackupserver.failed_tasks_24h" />
        <Block label="proxmoxbackupserver.cpu_usage" />
        <Block label="proxmoxbackupserver.memory_usage" />
      </Container>
    );
  }

  // check for presence of datastore key
  const hasDatastore = !!widget.datastore;
  // return index of specified datastore
  const datastoreIndex = hasDatastore ? datastoreData.data.findIndex(function(ds) { return ds.store == widget.datastore }) : -1;
  // calculate usage for specified datastore, unless no match, then calculate for all datastores returned by API
  const datastoreUsage = (datastoreIndex > -1) 
  ? (datastoreData.data[datastoreIndex].used / datastoreData.data[datastoreIndex].total) * 100 
  : ((datastoreData.data.reduce((sum, datastore) => sum + datastore.used, 0) / (datastoreData.data.reduce((sum, datastore) => sum + datastore.total, 0)))) * 100;
  
  const cpuUsage = hostData.data.cpu * 100;
  const memoryUsage = (hostData.data.memory.used / hostData.data.memory.total) * 100;
  const failedTasks = tasksData.total >= 100 ? "99+" : tasksData.total;

  return (
    <Container service={service}>
      <Block label="proxmoxbackupserver.datastore_usage" value={t("common.percent", { value: datastoreUsage })} />
      <Block label="proxmoxbackupserver.failed_tasks_24h" value={failedTasks} />
      <Block label="proxmoxbackupserver.cpu_usage" value={t("common.percent", { value: cpuUsage })} />
      <Block label="proxmoxbackupserver.memory_usage" value={t("common.percent", { value: memoryUsage })} />
    </Container>
  );
}
