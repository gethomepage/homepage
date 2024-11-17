import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: appsData, error: appsError } = useWidgetAPI(widget, "applications");

  const appCounts = ["apps", "synced", "outOfSync", "healthy", "progressing", "degraded", "suspended", "missing"].map(
    (status) => {
      if (status === "apps") {
        return { status, count: appsData?.items?.length };
      }
      const apiStatus = status.charAt(0).toUpperCase() + status.slice(1);
      const count = appsData?.items?.filter(
        (item) => item.status?.sync?.status === apiStatus || item.status?.health?.status === apiStatus,
      ).length;
      return { status, count };
    },
  );

  if (appsError) {
    return <Container service={service} error={appsError} />;
  }

  if (!appsData) {
    return (
      <Container service={service}>
        {appCounts.map((a) => (
          <Block label={`argocd.${a.status}`} key={a.status} />
        ))}
      </Container>
    );
  }

  return (
    <Container service={service}>
      {appCounts.map((a) => (
        <Block label={`argocd.${a.status}`} key={a.status} value={a.count} />
      ))}
    </Container>
  );
}
