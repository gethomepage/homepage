import Block from "components/services/widget/block";
import Container from "components/services/widget/container";

import useWidgetAPI from "utils/proxy/use-widget-api";
import withWidgetFields from "utils/widget-fields";

export default function Component({ service: configuredService }) {
  const service = withWidgetFields(configuredService, ["providers", "models", "combos", "status"]);
  const { widget } = service;

  const { data: providersData, error: providersError } = useWidgetAPI(widget, "providers");
  const { data: modelsData, error: modelsError } = useWidgetAPI(widget, "models");
  const { data: combosData, error: combosError } = useWidgetAPI(widget, "combos");

  const error = providersError || modelsError || combosError;

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!providersData || !modelsData || !combosData) {
    return (
      <Container service={service}>
        <Block label="9router.providers" />
        <Block label="9router.models" />
        <Block label="9router.combos" />
        <Block label="9router.status" />
      </Container>
    );
  }

  const providers = providersData.connections?.length ?? 0;
  const activeProviders =
    providersData.connections?.filter(
      (connection) => connection.isActive !== false && connection.testStatus !== "unavailable",
    ).length ?? 0;
  const models = modelsData.models?.length ?? 0;
  const combos = combosData.combos?.length ?? 0;
  const status = activeProviders > 0 ? "OK" : "Down";

  return (
    <Container service={service}>
      <Block label="9router.providers" value={providers} />
      <Block label="9router.models" value={models} />
      <Block label="9router.combos" value={combos} />
      <Block label="9router.status" value={status} />
    </Container>
  );
}
