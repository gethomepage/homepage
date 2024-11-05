import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { data: statusData, error: statusError } = useWidgetAPI(widget, "status");

  if (statusError) {
    return <Container service={service} error={statusError ?? 'error'} />;
  }

  if (!statusData) {
    return (
      <Container service={service}>
        <Block label="teslamate.car_name" />
        <Block label="teslamate.odometer" />
        <Block label="teslamate.battery_level" />
      </Container>
    );
  }

  return (
    <>
      <Container service={service}>
        <Block label="teslamate.car_name" value={statusData.car_name} />
        <Block label="teslamate.odometer" value={`${statusData.odometer} kms`} />
        <Block label="teslamate.battery_level" value={`${statusData.battery_level}%`} />
      </Container>
    </>
  );
}
