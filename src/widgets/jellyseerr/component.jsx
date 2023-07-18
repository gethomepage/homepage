import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;

  const { data: statsData, error: statsError } = useWidgetAPI(widget, "request/count");

  if (statsError) {
    return <Container service={service} error={statsError} />;
  }

  if (!statsData) {
    return (
      <Container service={service}>
        <Block label="jellyseerr.total" />
        <Block label="jellyseerr.movies" />
        <Block label="jellyseerr.series" />
        <Block label="jellyseerr.pending" />
        <Block label="jellyseerr.approved" />
        <Block label="jellyseerr.declined" />
        <Block label="jellyseerr.processing" />
        <Block label="jellyseerr.available" />
      </Container>
    );
  }

  return (
    <Container service={service}>
      <Block label="jellyseerr.total" value={statsData.total} />
      <Block label="jellyseerr.movies" value={statsData.movie} />
      <Block label="jellyseerr.series" value={statsData.tv} />
      <Block label="jellyseerr.pending" value={statsData.pending} />
      <Block label="jellyseerr.approved" value={statsData.approved} />
      <Block label="jellyseerr.declined" value={statsData.declined} />
      <Block label="jellyseerr.processing" value={statsData.processing} />
      <Block label="jellyseerr.available" value={statsData.available} />
    </Container>
  );
}
