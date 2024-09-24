import Container from "components/services/widget/container";
import Block from "components/services/widget/block";
import useWidgetAPI from "utils/proxy/use-widget-api";

export default function Component({ service }) {
  const { widget } = service;
  const { data: vehicleInfo, error } = useWidgetAPI(widget, "vehicleinfo");

  if (error) {
    return <Container service={service} error={error} />;
  }

  if (!vehicleInfo) {
    return (
      <Container service={service}>
        <Block label="lubelogger.vehicles" />
        <Block label="lubelogger.serviceRecords" />
        <Block label="lubelogger.reminders" />
      </Container>
    );
  }

  const totalReminders = vehicleInfo.reduce(
    (acc, val) => acc + val.veryUrgentReminderCount + val.urgentReminderCount + val.notUrgentReminderCount,
    0,
  );
  const totalServiceRecords = vehicleInfo.reduce((acc, val) => acc + val.serviceRecordCount, 0);

  return (
    <Container service={service}>
      <Block label="lubelogger.vehicles" value={vehicleInfo.length} />
      <Block label="lubelogger.serviceRecords" value={totalServiceRecords} />
      <Block label="lubelogger.reminders" value={totalReminders} />
    </Container>
  );
}
