import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";
import { useTranslation } from "next-i18next";

export default function Component({ service }) {
  const { widget: { server: isServerWidget } } = service;
  
  if (isServerWidget) {
    return ServerComponent(service);
  } else {
    return ClusterComponent(service);
  }
}

function ServerComponent(service) {
  const { t } = useTranslation();
  const { widget } = service;
  const { enableDiagnostics = true, enableNetwork = true } = widget;
  const { data: serverData, error: serverError } = useWidgetAPI(widget, "server");
  const shouldRenderDiagnostics = enableDiagnostics && serverData?.server?.status === "ACTIVE";
  
  let diagnosticsData, diagnosticsError;
  if (shouldRenderDiagnostics) {
    const diagnosticsResult = useWidgetAPI(widget, "diagnostics");
    diagnosticsData = diagnosticsResult.data;
    diagnosticsError = diagnosticsResult.error;
  }

  if (serverError) {
    return <Container service={service} error={serverError} />;
  } else if (diagnosticsError) {
    return <Container service={service} error={diagnosticsError} />;
  }

  if (!serverData || (shouldRenderDiagnostics && !diagnosticsData)) {
    return (
      <Container service={service}>
          <Block label="openstack.name"/>
          <Block label="openstack.status"/>
          {enableDiagnostics && 
            <>            
              <Block label="openstack.cputime"/>
              <Block label="resources.mem"/>
            </>
          }
      </Container>
    );
  }
  
  const { server: { "status": serverStatus, name: serverName } } = serverData;
  const uptime = diagnosticsData?.cpu0_time;
  const memoryUsage = (diagnosticsData?.["memory-rss"] / diagnosticsData?.["memory-actual"]) * 100;

  return (
    <Container service={service}>
        <Block label="openstack.name" value={serverName} />
        <Block label="openstack.status" value={t("openstack.states." + serverStatus.toLowerCase())} />

        {shouldRenderDiagnostics &&
          <>
            <Block label="openstack.cputime" value={t("common.duration", { value: uptime / 1000000000 })} />
            <Block label="resources.mem" value={t("common.percent", { value: memoryUsage.toFixed() })} />
          </>
        }

        {enableDiagnostics && serverStatus !== "ACTIVE" &&
          <>
            <Block label="openstack.cputime"/>
            <Block label="resources.mem"/>
          </>
        }
        
        {enableNetwork &&
          Object.entries(serverData.server.addresses).map(([name, network]) => (
            <Block label={name} value={network[0].addr} />
          ))
        }
    </Container>
  );
}

function ClusterComponent(service) {
  const { widget } = service;
  const { data, error } = useWidgetAPI(widget, "servers");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
          <Block label="openstack.total"/>
          <Block label="openstack.states.active"/>
          <Block label="openstack.states.shutoff"/>
          <Block label="openstack.states.other"/>
      </Container>
    );
  }

  let activeCount = 0;
  let shutoffCount = 0;
  let othersCount = 0;

  data.servers.forEach(server => {
    switch (server.status) {
      case "ACTIVE":
        activeCount++;
        break;
      case "SHUTOFF":
        shutoffCount++;
        break;
      default:
        othersCount++;
    }
  });

  return (
    <Container service={service}>
        <Block label="openstack.total" value={data.servers.length}/>
        <Block label="openstack.states.active" value={activeCount}/>
        <Block label="openstack.states.shutoff" value={shutoffCount}/>
        <Block label="openstack.states.other" value={othersCount}/>
    </Container>
  );
}