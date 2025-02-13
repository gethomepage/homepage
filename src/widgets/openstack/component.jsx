import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";
import { useTranslation } from "next-i18next";

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;
  const { data: serverData, error: serverError } = useWidgetAPI(widget, "server");
  const { data: diagnosticsData, error: diagnosticsError } = useWidgetAPI(widget, "serverDiagnostics");

  if (serverError) {
    return <Container service={service} error={serverError} />;
  } else if (diagnosticsError) {
    return <Container service={service} error={diagnosticsError} />;
  }

  if (!diagnosticsData || !serverData) {
    return (
      <Container service={service}>
          <Block label="openstack.name"/>
          <Block label="openstack.status"/>
          <Block label="openstack.cputime"/>
          <Block label="resources.mem"/>
      </Container>
    );
  }
  
  const { server: { status: serverStatus, name: serverName } } = serverData;
  const uptime = diagnosticsData.cpu0_time;
  const memoryUsage = (diagnosticsData["memory-rss"] / diagnosticsData["memory-actual"]) * 100;

  return (
    <Container service={service}>
        <Block label="openstack.name" value={serverName} />
        <Block label="openstack.status" value={t("openstack.states." + serverStatus.toLowerCase())} />

        {serverStatus === 'ACTIVE' &&
          <>
            <Block label="openstack.cputime" value={t("common.duration", { value: uptime / 1000000000 })} />
            <Block label="resources.mem" value={t("common.percent", { value: memoryUsage.toFixed() })} />
          </>
        }

        {serverStatus !== 'ACTIVE' &&
          <>
            <Block label="openstack.cputime"/>
            <Block label="resources.mem"/>
          </>
        }
        
        {
          Object.entries(serverData.server.addresses).map(([name, network]) => (
            <Block label={name} value={network[0].addr} />
          ))
        }
    </Container>
  );
}
