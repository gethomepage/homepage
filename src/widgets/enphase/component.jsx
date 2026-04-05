import Block from "components/services/widget/block";
import Container from "components/services/widget/container";
import useWidgetAPI from "utils/proxy/use-widget-api";

function formatPower(watts) {
  if (watts === undefined || watts === null) return "-";
  if (Math.abs(watts) >= 1000) return `${(watts / 1000).toFixed(2)} kW`;
  return `${Math.round(watts)} W`;
}

function formatEnergy(wattHours) {
  if (wattHours === undefined || wattHours === null) return "-";
  if (wattHours >= 1000) return `${(wattHours / 1000).toFixed(2)} kWh`;
  return `${Math.round(wattHours)} Wh`;
}

export default function Component({ service }) {
  const { widget } = service;

  const { data, error } = useWidgetAPI(widget, "production", { refreshInterval: 60000 });

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="enphase.produced_today" />
        <Block label="enphase.consumed_today" />
        <Block label="enphase.producing" />
        <Block label="enphase.imported_today" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="enphase.produced_today" value={formatEnergy(data.whToday)} />
      {data.consumptionWhToday !== null && (
        <Block label="enphase.consumed_today" value={formatEnergy(data.consumptionWhToday)} />
      )}
      <Block label="enphase.producing" value={formatPower(data.wNow)} />
      {data.exportedToday !== null && data.exportedToday > 0 && (
        <Block label="enphase.exported_today" value={formatEnergy(data.exportedToday)} />
      )}
      {data.importedToday !== null && data.importedToday > 0 && (
        <Block label="enphase.imported_today" value={formatEnergy(data.importedToday)} />
      )}
    </Container>
  );
}
