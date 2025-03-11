import { useTranslation } from "next-i18next";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const {
    widget: { server: isServerWidget },
  } = service;

  if (isServerWidget) {
    return <ServerComponent service={service} />;
  }

  return <ClusterComponent service={service} />;
}

function ServerComponent({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { enableDiagnostics = true, enableNetwork = true } = widget;
  const { data: serverData, error: serverError } = useWidgetAPI(widget, "server");
  const { data: diagnosticsData, error: diagnosticsError } = useWidgetAPI(widget, "diagnostics");

  if (serverError) {
    return <Container service={service} error={serverError} />;
  } else if (diagnosticsError && diagnosticsError.status !== 409) {
    return <Container service={service} error={diagnosticsError} />;
  }

  if (!serverData || (enableDiagnostics && !diagnosticsData)) {
    return (
      <Container service={service}>
        <Block label="openstack.name" />
        <Block label="openstack.status" />
        {enableDiagnostics && (
          <>
            <Block label="openstack.cputime" />
            <Block label="resources.mem" />
          </>
        )}
      </Container>
    );
  }

  const {
    server: { status: serverStatus, name: serverName },
  } = serverData;
  const uptime = diagnosticsData?.cpu0_time;
  let memoryUsage;
  if (enableDiagnostics && serverStatus === "ACTIVE") {
    memoryUsage = (diagnosticsData["memory-rss"] / diagnosticsData["memory-actual"]) * 100;
  }

  return (
    <Container service={service}>
      <Block label="openstack.name" value={serverName} />
      <Block label="openstack.status" value={t(`openstack.states.${serverStatus.toLowerCase()}`)} />

      {enableDiagnostics && serverStatus === "ACTIVE" && (
        <>
          <Block label="openstack.cputime" value={t("common.duration", { value: uptime / 1000000000 })} />
          <Block label="resources.mem" value={t("common.percent", { value: memoryUsage.toFixed() })} />
        </>
      )}

      {enableDiagnostics && serverStatus !== "ACTIVE" && (
        <>
          <Block label="openstack.cputime" />
          <Block label="resources.mem" />
        </>
      )}

      {enableNetwork &&
        Object.entries(serverData.server.addresses).map(([name, network]) => (
          <Block key={name} label={name} value={network[0].addr} />
        ))}
    </Container>
  );
}

function ClusterComponent({ service }) {
  const { widget } = service;
  const { data, error } = useWidgetAPI(widget, "servers");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="openstack.total" />
        <Block label="openstack.states.active" />
        <Block label="openstack.states.shutoff" />
        <Block label="openstack.states.other" />
      </Container>
    );
  }

  let activeCount = 0;
  let shutoffCount = 0;
  let othersCount = 0;

  data.servers.forEach((server) => {
    switch (server.status) {
      case "ACTIVE":
        activeCount += 1;
        break;
      case "SHUTOFF":
        shutoffCount += 1;
        break;
      default:
        othersCount += 1;
    }
  });

  return (
    <Container service={service}>
      <Block label="openstack.total" value={data.servers.length} />
      <Block label="openstack.states.active" value={activeCount} />
      <Block label="openstack.states.shutoff" value={shutoffCount} />
      <Block label="openstack.states.other" value={othersCount} />
    </Container>
  );
}
