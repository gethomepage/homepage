import { useTranslation } from "next-i18next/pages";

import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export const airtrailDefaultFields = ["flights", "distance", "duration", "airports"];

const MAX_ALLOWED_FIELDS = 4;

export default function Component({ service }) {
  const { t } = useTranslation();
  const { widget } = service;

  if (!widget.fields || widget.fields.length === 0) {
    widget.fields = airtrailDefaultFields;
  }
  if (widget.fields.length > MAX_ALLOWED_FIELDS) {
    widget.fields = widget.fields.slice(0, MAX_ALLOWED_FIELDS);
  }

  const { data, error } = useWidgetAPI(widget, "stats");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!data) {
    return (
      <Container service={service}>
        <Block label="airtrail.flights" />
        <Block label="airtrail.distance" />
        <Block label="airtrail.duration" />
        <Block label="airtrail.airports" />
        <Block label="airtrail.topAirline" />
        <Block label="airtrail.topAirport" />
        <Block label="airtrail.topAircraft" />
        <Block label="airtrail.topRoute" />
      </Container>
    );
  }

  const { stats } = data;
  const durationHours = Math.round(stats.durationSeconds / 3600);

  return (
    <Container service={service}>
      <Block label="airtrail.flights" value={t("common.number", { value: stats.flights })} />
      <Block label="airtrail.distance" value={`${t("common.number", { value: Math.round(stats.distanceKm) })} km`} />
      <Block label="airtrail.duration" value={`${t("common.number", { value: durationHours })} h`} />
      <Block label="airtrail.airports" value={t("common.number", { value: stats.airports })} />
      <Block label="airtrail.topAirline" value={stats.topAirline ? `${stats.topAirline.name} (${stats.topAirline.count})` : "-"} />
      <Block label="airtrail.topAirport" value={stats.topAirport ? `${stats.topAirport.iata ?? stats.topAirport.icao} (${stats.topAirport.count})` : "-"} />
      <Block label="airtrail.topAircraft" value={stats.topAircraft ? `${stats.topAircraft.name} (${stats.topAircraft.count})` : "-"} />
      <Block
        label="airtrail.topRoute"
        value={
          stats.topRoute
            ? `${stats.topRoute.from.iata ?? stats.topRoute.from.icao} → ${stats.topRoute.to.iata ?? stats.topRoute.to.icao} (${stats.topRoute.count})`
            : "-"
        }
      />
    </Container>
  );
}
