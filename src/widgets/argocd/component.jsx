import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

const DEFAULT_FIELDS = ["apps", "synced", "outOfSync", "healthy"];

export default function Component({ service: configuredService }) {
  const service = withWidgetFields(configuredService, DEFAULT_FIELDS);
  const { widget } = service;

  const { data: appsData, error: appsError } = useWidgetAPI(widget, "applications");

  const appCounts = widget.fields.map((status) => {
    if (status === "apps") {
      return { status, count: appsData?.items?.length };
    }
    const count = appsData?.items?.filter(
      (item) =>
        item.status?.sync?.status.toLowerCase() === status.toLowerCase() ||
        item.status?.health?.status.toLowerCase() === status.toLowerCase(),
    ).length;
    return { status, count };
  });

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
